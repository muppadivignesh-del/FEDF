const db = require('../config/database');

exports.getInbox = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
      FROM messages m JOIN users u ON u.id=m.sender_id
      WHERE m.receiver_id=$1 OR (m.is_broadcast=true AND m.receiver_id IS NULL)
      ORDER BY m.created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSent = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT m.*, u.name as receiver_name, u.role as receiver_role
      FROM messages m LEFT JOIN users u ON u.id=m.receiver_id
      WHERE m.sender_id=$1 ORDER BY m.created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, subject, body, is_broadcast } = req.body;
    if (!body) return res.status(400).json({ success: false, message: 'Message body required' });

    // Role-based sending permission checks
    if (req.user.role === 'student') {
      if (is_broadcast) return res.status(403).json({ success: false, message: 'Students cannot broadcast' });
      // Check receiver is a teacher assigned to student
      const student = await db.query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
      const teacherCheck = await db.query(
        `SELECT 1 FROM teachers t JOIN teacher_subjects ts ON ts.teacher_id=t.id
         JOIN student_subjects ss ON ss.subject_id=ts.subject_id AND ss.student_id=$1
         WHERE t.user_id=$2`,
        [student.rows[0].id, receiver_id]
      );
      if (!teacherCheck.rows.length) return res.status(403).json({ success: false, message: 'You can only message your assigned teachers' });
    }

    if (is_broadcast) {
      // Send to all users of target role
      const { target_role } = req.body;
      let usersResult;
      if (target_role && target_role !== 'all') {
        usersResult = await db.query('SELECT id FROM users WHERE role=$1 AND is_active=true', [target_role]);
      } else {
        usersResult = await db.query('SELECT id FROM users WHERE is_active=true AND id!=$1', [req.user.id]);
      }
      for (const u of usersResult.rows) {
        await db.query(
          `INSERT INTO messages (sender_id, receiver_id, subject, body, is_broadcast) VALUES ($1,$2,$3,$4,true)`,
          [req.user.id, u.id, subject, body]
        );
        await db.query(
          `INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,'info')`,
          [u.id, `📢 ${subject || 'New Announcement'}`, body.substring(0, 200)]
        );
      }
    } else {
      await db.query(
        `INSERT INTO messages (sender_id, receiver_id, subject, body) VALUES ($1,$2,$3,$4)`,
        [req.user.id, receiver_id, subject, body]
      );
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,'info')`,
        [receiver_id, `💬 New message from ${req.user.name}`, body.substring(0, 200)]
      );
    }

    res.status(201).json({ success: true, message: 'Message sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE messages SET is_read=true, read_at=NOW() WHERE id=$1 AND receiver_id=$2', [id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getContacts = async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await db.query('SELECT id, name, email, role, avatar FROM users WHERE id!=$1 AND is_active=true ORDER BY name', [req.user.id]);
    } else if (req.user.role === 'teacher') {
      const teacher = await db.query('SELECT id FROM teachers WHERE user_id=$1', [req.user.id]);
      result = await db.query(`
        SELECT DISTINCT u.id, u.name, u.email, u.role, u.avatar FROM users u
        JOIN students s ON s.user_id=u.id
        JOIN student_subjects ss ON ss.student_id=s.id
        JOIN teacher_subjects ts ON ts.subject_id=ss.subject_id AND ts.teacher_id=$1
        UNION
        SELECT id, name, email, role, avatar FROM users WHERE role='admin' AND id!=$2
        ORDER BY name`, [teacher.rows[0].id, req.user.id]);
    } else {
      const student = await db.query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
      result = await db.query(`
        SELECT DISTINCT u.id, u.name, u.email, u.role, u.avatar FROM users u
        JOIN teachers t ON t.user_id=u.id
        JOIN teacher_subjects ts ON ts.teacher_id=t.id
        JOIN student_subjects ss ON ss.subject_id=ts.subject_id AND ss.student_id=$1
        ORDER BY u.name`, [student.rows[0].id]);
    }
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Notifications
exports.getNotifications = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 30',
      [req.user.id]
    );
    const unread = await db.query('SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND is_read=false', [req.user.id]);
    res.json({ success: true, data: result.rows, unreadCount: parseInt(unread.rows[0].count) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2', [id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read=true WHERE user_id=$1', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, u.name as created_by_name FROM announcements a
      JOIN users u ON u.id=a.created_by
      WHERE a.is_active=true AND (a.target_role='all' OR a.target_role=$1)
      ORDER BY a.created_at DESC`,
      [req.user.role]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, target_role } = req.body;
    await db.query(
      'INSERT INTO announcements (title, content, created_by, target_role) VALUES ($1,$2,$3,$4)',
      [title, content, req.user.id, target_role || 'all']
    );
    // Push as notification to target users
    const users = target_role && target_role !== 'all'
      ? await db.query('SELECT id FROM users WHERE role=$1 AND is_active=true', [target_role])
      : await db.query('SELECT id FROM users WHERE is_active=true AND id!=$1', [req.user.id]);
    for (const u of users.rows) {
      await db.query('INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,$4)',
        [u.id, `📢 ${title}`, content.substring(0, 200), 'info']);
    }
    res.status(201).json({ success: true, message: 'Announcement published' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
