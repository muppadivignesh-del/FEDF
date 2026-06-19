const db = require('../config/database');
const { analyzeStudent } = require('../services/aiAnalysis');

// Get teacher's students
exports.getMyStudents = async (req, res) => {
  try {
    const teacher = await db.query('SELECT id FROM teachers WHERE user_id=$1', [req.user.id]);
    if (!teacher.rows.length) return res.status(404).json({ success: false, message: 'Teacher not found' });
    const teacherId = teacher.rows[0].id;

    const result = await db.query(`
      SELECT DISTINCT u.name, u.email, s.id as student_id, s.student_id as sid,
             s.class, s.section, s.roll_number,
             ai.risk_level, ai.risk_score, ai.attendance_score, ai.performance_score
      FROM students s
      JOIN users u ON u.id=s.user_id
      JOIN student_subjects ss ON ss.student_id=s.id
      JOIN teacher_subjects ts ON ts.subject_id=ss.subject_id AND ts.teacher_id=$1
      LEFT JOIN ai_analysis ai ON ai.student_id=s.id
      ORDER BY u.name`,
      [teacherId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Dashboard stats for teacher
exports.getDashboard = async (req, res) => {
  try {
    const teacher = await db.query('SELECT id FROM teachers WHERE user_id=$1', [req.user.id]);
    if (!teacher.rows.length) return res.status(404).json({ success: false, message: 'Teacher not found' });
    const teacherId = teacher.rows[0].id;

    const [studentCount, subjectCount, pendingAssignments, highRisk, unreadMsg] = await Promise.all([
      db.query(`SELECT COUNT(DISTINCT ss.student_id) FROM student_subjects ss JOIN teacher_subjects ts ON ts.subject_id=ss.subject_id WHERE ts.teacher_id=$1`, [teacherId]),
      db.query('SELECT COUNT(*) FROM teacher_subjects WHERE teacher_id=$1', [teacherId]),
      db.query('SELECT COUNT(*) FROM assignments WHERE teacher_id=$1 AND is_active=true', [teacherId]),
      db.query(`SELECT COUNT(DISTINCT s.id) FROM students s JOIN student_subjects ss ON ss.student_id=s.id JOIN teacher_subjects ts ON ts.subject_id=ss.subject_id AND ts.teacher_id=$1 JOIN ai_analysis ai ON ai.student_id=s.id WHERE ai.risk_level='high'`, [teacherId]),
      db.query('SELECT COUNT(*) FROM messages WHERE receiver_id=$1 AND is_read=false', [req.user.id]),
    ]);

    const recentAttendance = await db.query(`
      SELECT TO_CHAR(a.date,'Mon DD') as date,
             ROUND(100.0*SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END)/COUNT(*),2) as rate
      FROM attendance a JOIN teacher_subjects ts ON ts.subject_id=a.subject_id AND ts.teacher_id=$1
      WHERE a.date >= NOW()-INTERVAL '7 days' GROUP BY a.date ORDER BY a.date`,
      [teacherId]
    );

    res.json({
      success: true,
      data: {
        stats: {
          students: parseInt(studentCount.rows[0].count),
          subjects: parseInt(subjectCount.rows[0].count),
          assignments: parseInt(pendingAssignments.rows[0].count),
          highRisk: parseInt(highRisk.rows[0].count),
          unreadMessages: parseInt(unreadMsg.rows[0].count),
        },
        recentAttendance: recentAttendance.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Attendance management
exports.markAttendance = async (req, res) => {
  try {
    const teacher = await db.query('SELECT id FROM teachers WHERE user_id=$1', [req.user.id]);
    const teacherId = teacher.rows[0].id;
    const { records, subject_id, date } = req.body;
    // records: [{student_id, status}]
    for (const rec of records) {
      await db.query(
        `INSERT INTO attendance (student_id, subject_id, teacher_id, date, status)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (student_id, subject_id, date) DO UPDATE SET status=$5`,
        [rec.student_id, subject_id, teacherId, date, rec.status]
      );
    }
    // Re-analyze affected students
    for (const rec of records) {
      analyzeStudent(rec.student_id).catch(() => {});
    }
    res.json({ success: true, message: 'Attendance saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { subject_id, date, student_id } = req.query;
    let q = `SELECT a.*, u.name as student_name, s.student_id as sid, sub.name as subject_name
             FROM attendance a
             JOIN students s ON s.id=a.student_id
             JOIN users u ON u.id=s.user_id
             JOIN subjects sub ON sub.id=a.subject_id
             WHERE 1=1`;
    const params = [];
    if (subject_id) { params.push(subject_id); q += ` AND a.subject_id=$${params.length}`; }
    if (date) { params.push(date); q += ` AND a.date=$${params.length}`; }
    if (student_id) { params.push(student_id); q += ` AND a.student_id=$${params.length}`; }
    q += ' ORDER BY a.date DESC';
    const result = await db.query(q, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Assignments
exports.createAssignment = async (req, res) => {
  try {
    const teacher = await db.query('SELECT id FROM teachers WHERE user_id=$1', [req.user.id]);
    const { title, description, subject_id, due_date, total_marks } = req.body;
    await db.query(
      `INSERT INTO assignments (title, description, subject_id, teacher_id, due_date, total_marks)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [title, description, subject_id, teacher.rows[0].id, due_date, total_marks || 100]
    );
    res.status(201).json({ success: true, message: 'Assignment created' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyAssignments = async (req, res) => {
  try {
    const teacher = await db.query('SELECT id FROM teachers WHERE user_id=$1', [req.user.id]);
    const result = await db.query(`
      SELECT a.*, sub.name as subject_name,
             COUNT(asub.id) as submissions,
             COUNT(DISTINCT ss.student_id) as total_students
      FROM assignments a
      JOIN subjects sub ON sub.id=a.subject_id
      LEFT JOIN assignment_submissions asub ON asub.assignment_id=a.id
      LEFT JOIN student_subjects ss ON ss.subject_id=a.subject_id
      WHERE a.teacher_id=$1
      GROUP BY a.id, sub.name ORDER BY a.created_at DESC`,
      [teacher.rows[0].id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks_obtained, feedback } = req.body;
    await db.query(
      `UPDATE assignment_submissions SET marks_obtained=$1, feedback=$2, status='graded' WHERE id=$3`,
      [marks_obtained, feedback, id]
    );
    res.json({ success: true, message: 'Submission graded' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Marks
exports.addMarks = async (req, res) => {
  try {
    const teacher = await db.query('SELECT id FROM teachers WHERE user_id=$1', [req.user.id]);
    const { student_id, subject_id, exam_type, marks_obtained, total_marks, exam_date, remarks } = req.body;
    await db.query(
      `INSERT INTO marks (student_id, subject_id, teacher_id, exam_type, marks_obtained, total_marks, exam_date, remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [student_id, subject_id, teacher.rows[0].id, exam_type, marks_obtained, total_marks || 100, exam_date, remarks]
    );
    analyzeStudent(student_id).catch(() => {});
    res.status(201).json({ success: true, message: 'Marks added' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getClassAnalytics = async (req, res) => {
  try {
    const teacher = await db.query('SELECT id FROM teachers WHERE user_id=$1', [req.user.id]);
    const teacherId = teacher.rows[0].id;

    const subjectPerf = await db.query(`
      SELECT sub.name, ROUND(AVG(m.percentage),2) as avg_score, 
             COUNT(DISTINCT m.student_id) as student_count
      FROM marks m JOIN subjects sub ON sub.id=m.subject_id
      JOIN teacher_subjects ts ON ts.subject_id=m.subject_id AND ts.teacher_id=$1
      GROUP BY sub.name`, [teacherId]);

    const riskDist = await db.query(`
      SELECT ai.risk_level, COUNT(*) as count
      FROM ai_analysis ai JOIN students s ON s.id=ai.student_id
      JOIN student_subjects ss ON ss.student_id=s.id
      JOIN teacher_subjects ts ON ts.subject_id=ss.subject_id AND ts.teacher_id=$1
      GROUP BY ai.risk_level`, [teacherId]);

    const weakStudents = await db.query(`
      SELECT DISTINCT u.name, s.id as student_id, ai.risk_score, ai.risk_level,
             ai.attendance_score, ai.performance_score
      FROM ai_analysis ai
      JOIN students s ON s.id=ai.student_id
      JOIN users u ON u.id=s.user_id
      JOIN student_subjects ss ON ss.student_id=s.id
      JOIN teacher_subjects ts ON ts.subject_id=ss.subject_id AND ts.teacher_id=$1
      WHERE ai.risk_level IN ('high','medium')
      ORDER BY ai.risk_score ASC LIMIT 10`, [teacherId]);

    res.json({ success: true, data: { subjectPerf: subjectPerf.rows, riskDist: riskDist.rows, weakStudents: weakStudents.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
