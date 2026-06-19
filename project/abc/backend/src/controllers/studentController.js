const db = require('../config/database');
const { analyzeStudent, getStudentAnalysis } = require('../services/aiAnalysis');

// Get student's own data
exports.getDashboard = async (req, res) => {
  try {
    const student = await db.query('SELECT * FROM students WHERE user_id=$1', [req.user.id]);
    if (!student.rows.length) return res.status(404).json({ success: false, message: 'Student not found' });
    const s = student.rows[0];

    const [attendance, avgMarks, assignments, aiData, notifications] = await Promise.all([
      db.query(`SELECT COUNT(*) as total, SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as attended FROM attendance WHERE student_id=$1`, [s.id]),
      db.query('SELECT ROUND(AVG(percentage),2) as avg FROM marks WHERE student_id=$1', [s.id]),
      db.query(`SELECT COUNT(*) as total,
                SUM(CASE WHEN asub.id IS NOT NULL THEN 1 ELSE 0 END) as submitted
                FROM assignments a
                JOIN student_subjects ss ON ss.subject_id=a.subject_id AND ss.student_id=$1
                LEFT JOIN assignment_submissions asub ON asub.assignment_id=a.id AND asub.student_id=$1
                WHERE a.due_date < NOW()`, [s.id]),
      getStudentAnalysis(s.id),
      db.query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 5', [req.user.id]),
    ]);

    const att = attendance.rows[0];
    const attPct = att.total > 0 ? Math.round((att.attended / att.total) * 100) : 0;

    res.json({
      success: true,
      data: {
        student: s,
        stats: {
          attendance: attPct,
          avgMarks: parseFloat(avgMarks.rows[0].avg) || 0,
          assignmentsSubmitted: parseInt(assignments.rows[0].submitted) || 0,
          assignmentsTotal: parseInt(assignments.rows[0].total) || 0,
        },
        ai: aiData,
        notifications: notifications.rows,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const student = await db.query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    const s = student.rows[0];
    const result = await db.query(`
      SELECT a.*, sub.name as subject_name
      FROM attendance a JOIN subjects sub ON sub.id=a.subject_id
      WHERE a.student_id=$1 ORDER BY a.date DESC`, [s.id]);

    const summary = await db.query(`
      SELECT sub.name as subject_name,
             COUNT(*) as total,
             SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as attended,
             ROUND(100.0*SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END)/COUNT(*),2) as percentage
      FROM attendance a JOIN subjects sub ON sub.id=a.subject_id
      WHERE a.student_id=$1 GROUP BY sub.name`, [s.id]);

    res.json({ success: true, data: { records: result.rows, summary: summary.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMarks = async (req, res) => {
  try {
    const student = await db.query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    const s = student.rows[0];
    const marks = await db.query(`
      SELECT m.*, sub.name as subject_name
      FROM marks m JOIN subjects sub ON sub.id=m.subject_id
      WHERE m.student_id=$1 ORDER BY m.exam_date DESC`, [s.id]);

    const subjectAvg = await db.query(`
      SELECT sub.name, ROUND(AVG(m.percentage),2) as avg,
             MAX(m.percentage) as max, MIN(m.percentage) as min
      FROM marks m JOIN subjects sub ON sub.id=m.subject_id
      WHERE m.student_id=$1 GROUP BY sub.name`, [s.id]);

    res.json({ success: true, data: { marks: marks.rows, subjectAvg: subjectAvg.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const student = await db.query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    const s = student.rows[0];
    const result = await db.query(`
      SELECT a.*, sub.name as subject_name,
             asub.id as submission_id, asub.submitted_at, asub.marks_obtained, asub.feedback, asub.status as sub_status
      FROM assignments a
      JOIN student_subjects ss ON ss.subject_id=a.subject_id AND ss.student_id=$1
      JOIN subjects sub ON sub.id=a.subject_id
      LEFT JOIN assignment_submissions asub ON asub.assignment_id=a.id AND asub.student_id=$1
      WHERE a.is_active=true ORDER BY a.due_date ASC`, [s.id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const student = await db.query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    const { assignment_id } = req.body;
    const s = student.rows[0];
    await db.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, status) VALUES ($1,$2,'submitted')
       ON CONFLICT (assignment_id, student_id) DO UPDATE SET submitted_at=NOW(), status='submitted'`,
      [assignment_id, s.id]
    );
    analyzeStudent(s.id).catch(() => {});
    res.json({ success: true, message: 'Assignment submitted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAIAnalysis = async (req, res) => {
  try {
    const student = await db.query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    const analysis = await analyzeStudent(student.rows[0].id);
    res.json({ success: true, data: analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPerformanceTrend = async (req, res) => {
  try {
    const student = await db.query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    const s = student.rows[0];
    const result = await db.query(`
      SELECT TO_CHAR(exam_date,'Mon YYYY') as period,
             ROUND(AVG(percentage),2) as avg_score,
             exam_type
      FROM marks WHERE student_id=$1
      GROUP BY TO_CHAR(exam_date,'Mon YYYY'), EXTRACT(YEAR FROM exam_date), EXTRACT(MONTH FROM exam_date), exam_type
      ORDER BY EXTRACT(YEAR FROM exam_date), EXTRACT(MONTH FROM exam_date)`,
      [s.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
