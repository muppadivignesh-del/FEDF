const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { analyzeAllStudents } = require('../services/aiAnalysis');

// ─── Dashboard ────────────────────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const [students, teachers, subjects, messages] = await Promise.all([
      db.query('SELECT COUNT(*) FROM students'),
      db.query('SELECT COUNT(*) FROM teachers'),
      db.query('SELECT COUNT(*) FROM subjects WHERE is_active=true'),
      db.query('SELECT COUNT(*) FROM messages WHERE receiver_id=$1 AND is_read=false', [req.user.id]),
    ]);

    const riskData = await db.query(
      `SELECT risk_level, COUNT(*) as count FROM ai_analysis GROUP BY risk_level`
    );
    const recentStudents = await db.query(
      `SELECT u.name, u.email, s.class, s.section, u.created_at
       FROM students s JOIN users u ON u.id=s.user_id ORDER BY u.created_at DESC LIMIT 5`
    );

    const attendanceToday = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status='present') as present,
        COUNT(*) FILTER (WHERE status='absent') as absent,
        COUNT(*) as total
       FROM attendance WHERE date=CURRENT_DATE`
    );

    res.json({
      success: true,
      data: {
        stats: {
          students: parseInt(students.rows[0].count),
          teachers: parseInt(teachers.rows[0].count),
          subjects: parseInt(subjects.rows[0].count),
          unreadMessages: parseInt(messages.rows[0].count),
        },
        riskDistribution: riskData.rows,
        recentStudents: recentStudents.rows,
        attendanceToday: attendanceToday.rows[0],
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Students CRUD ────────────────────────────────────────────────────────────
exports.getStudents = async (req, res) => {
  try {
    const { search, class: cls, risk } = req.query;
    let query = `
      SELECT u.id as user_id, u.name, u.email, u.is_active, u.created_at, u.phone,
             s.id as student_id, s.student_id as sid, s.roll_number, s.class, s.section, s.semester,
             ai.risk_level, ai.risk_score
      FROM students s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN ai_analysis ai ON ai.student_id = s.id
      WHERE 1=1
    `;
    const params = [];
    if (search) { params.push(`%${search}%`); query += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR s.student_id ILIKE $${params.length})`; }
    if (cls) { params.push(cls); query += ` AND s.class = $${params.length}`; }
    if (risk) { params.push(risk); query += ` AND ai.risk_level = $${params.length}`; }
    query += ' ORDER BY u.created_at DESC';

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, class: cls, section, semester, roll_number, parent_name, parent_phone, date_of_birth } = req.body;
    const hashed = await bcrypt.hash(password || 'Student@123', 12);

    const userResult = await db.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,'student') RETURNING id`,
      [name, email, hashed]
    );
    const userId = userResult.rows[0].id;
    const studentId = `STU${Date.now().toString().slice(-6)}`;

    await db.query(
      `INSERT INTO students (user_id, student_id, roll_number, class, section, semester, parent_name, parent_phone, date_of_birth)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [userId, studentId, roll_number, cls, section, semester || 1, parent_name, parent_phone, date_of_birth]
    );

    res.status(201).json({ success: true, message: 'Student created successfully' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ success: false, message: 'Email already exists' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, class: cls, section, semester, roll_number, is_active } = req.body;
    const student = await db.query('SELECT user_id FROM students WHERE id=$1', [id]);
    if (!student.rows.length) return res.status(404).json({ success: false, message: 'Student not found' });

    await db.query('UPDATE users SET name=$1, email=$2, is_active=$3, updated_at=NOW() WHERE id=$4',
      [name, email, is_active !== undefined ? is_active : true, student.rows[0].user_id]);
    await db.query('UPDATE students SET class=$1, section=$2, semester=$3, roll_number=$4, updated_at=NOW() WHERE id=$5',
      [cls, section, semester, roll_number, id]);

    res.json({ success: true, message: 'Student updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const s = await db.query('SELECT user_id FROM students WHERE id=$1', [id]);
    if (!s.rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    await db.query('DELETE FROM users WHERE id=$1', [s.rows[0].user_id]);
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Teachers CRUD ────────────────────────────────────────────────────────────
exports.getTeachers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id as user_id, u.name, u.email, u.is_active, u.phone,
             t.id as teacher_id, t.employee_id, t.qualification, t.department, t.joining_date
      FROM teachers t JOIN users u ON u.id=t.user_id ORDER BY u.name`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const { name, email, password, qualification, department, joining_date } = req.body;
    const hashed = await bcrypt.hash(password || 'Teacher@123', 12);
    const userResult = await db.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,'teacher') RETURNING id`,
      [name, email, hashed]
    );
    const empId = `EMP${Date.now().toString().slice(-6)}`;
    await db.query(
      `INSERT INTO teachers (user_id, employee_id, qualification, department, joining_date) VALUES ($1,$2,$3,$4,$5)`,
      [userResult.rows[0].id, empId, qualification, department, joining_date]
    );
    res.status(201).json({ success: true, message: 'Teacher created' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ success: false, message: 'Email already exists' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, qualification, department, is_active } = req.body;
    const t = await db.query('SELECT user_id FROM teachers WHERE id=$1', [id]);
    if (!t.rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    await db.query('UPDATE users SET name=$1, email=$2, is_active=$3, updated_at=NOW() WHERE id=$4',
      [name, email, is_active !== undefined ? is_active : true, t.rows[0].user_id]);
    await db.query('UPDATE teachers SET qualification=$1, department=$2, updated_at=NOW() WHERE id=$3',
      [qualification, department, id]);
    res.json({ success: true, message: 'Teacher updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const t = await db.query('SELECT user_id FROM teachers WHERE id=$1', [id]);
    if (!t.rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    await db.query('DELETE FROM users WHERE id=$1', [t.rows[0].user_id]);
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Subjects CRUD ────────────────────────────────────────────────────────────
exports.getSubjects = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM subjects ORDER BY name');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { name, code, description, credits } = req.body;
    await db.query(
      'INSERT INTO subjects (name, code, description, credits) VALUES ($1,$2,$3,$4)',
      [name, code, description, credits || 3]
    );
    res.status(201).json({ success: true, message: 'Subject created' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ success: false, message: 'Subject code already exists' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, credits, is_active } = req.body;
    await db.query(
      'UPDATE subjects SET name=$1, code=$2, description=$3, credits=$4, is_active=$5, updated_at=NOW() WHERE id=$6',
      [name, code, description, credits, is_active, id]
    );
    res.json({ success: true, message: 'Subject updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM subjects WHERE id=$1', [id]);
    res.json({ success: true, message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── AI Batch Analysis ────────────────────────────────────────────────────────
exports.runAIAnalysis = async (req, res) => {
  try {
    await analyzeAllStudents();
    res.json({ success: true, message: 'AI analysis completed for all students' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI analysis failed' });
  }
};

// ─── Analytics ────────────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const [riskDist, subjectPerf, monthlyAttendance, topStudents] = await Promise.all([
      db.query(`SELECT risk_level, COUNT(*) as count FROM ai_analysis GROUP BY risk_level`),
      db.query(`SELECT sub.name, ROUND(AVG(m.percentage),2) as avg FROM marks m JOIN subjects sub ON sub.id=m.subject_id GROUP BY sub.name ORDER BY avg DESC`),
      db.query(`SELECT TO_CHAR(date,'Mon') as month, 
                ROUND(100.0*SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)/COUNT(*),2) as rate
                FROM attendance GROUP BY TO_CHAR(date,'Mon'), EXTRACT(MONTH FROM date) ORDER BY EXTRACT(MONTH FROM date)`),
      db.query(`SELECT u.name, ROUND(AVG(m.percentage),2) as avg_score, ai.risk_level
                FROM marks m JOIN students s ON s.id=m.student_id JOIN users u ON u.id=s.user_id
                LEFT JOIN ai_analysis ai ON ai.student_id=s.id
                GROUP BY u.name, ai.risk_level ORDER BY avg_score DESC LIMIT 10`),
    ]);
    res.json({ success: true, data: { riskDist: riskDist.rows, subjectPerf: subjectPerf.rows, monthlyAttendance: monthlyAttendance.rows, topStudents: topStudents.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
