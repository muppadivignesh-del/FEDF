/**
 * AI Analysis Service
 * Analyzes student performance using rule-based ML algorithms
 * Factors: Attendance, Marks, Assignment Completion, Historical Trends
 */

const db = require('../config/database');

// Weight configuration for risk scoring
const WEIGHTS = {
  attendance: 0.30,
  performance: 0.40,
  assignment: 0.20,
  trend: 0.10,
};

const THRESHOLDS = {
  attendance: { low: 85, medium: 75 },       // % above = low risk
  performance: { low: 70, medium: 55 },       // % above = low risk
  assignment: { low: 80, medium: 65 },        // % above = low risk
};

/**
 * Calculate attendance score (0-100)
 */
async function calculateAttendanceScore(studentId) {
  const result = await db.query(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END) as attended
     FROM attendance WHERE student_id = $1`,
    [studentId]
  );
  const { total, attended } = result.rows[0];
  if (!total || parseInt(total) === 0) return 100; // No data = assume good
  return Math.round((parseInt(attended) / parseInt(total)) * 100);
}

/**
 * Calculate academic performance score (0-100)
 */
async function calculatePerformanceScore(studentId) {
  const result = await db.query(
    `SELECT AVG(percentage) as avg_percentage FROM marks WHERE student_id = $1`,
    [studentId]
  );
  const avg = result.rows[0].avg_percentage;
  return avg ? Math.round(parseFloat(avg)) : 100;
}

/**
 * Calculate assignment completion score (0-100)
 */
async function calculateAssignmentScore(studentId) {
  // Get all assignments for enrolled subjects
  const total = await db.query(
    `SELECT COUNT(DISTINCT a.id) as total
     FROM assignments a
     JOIN student_subjects ss ON ss.subject_id = a.subject_id
     WHERE ss.student_id = $1 AND a.due_date < NOW()`,
    [studentId]
  );
  const submitted = await db.query(
    `SELECT COUNT(*) as submitted
     FROM assignment_submissions asub
     JOIN assignments a ON a.id = asub.assignment_id
     WHERE asub.student_id = $1`,
    [studentId]
  );
  const t = parseInt(total.rows[0].total) || 0;
  const s = parseInt(submitted.rows[0].submitted) || 0;
  if (t === 0) return 100;
  return Math.round((s / t) * 100);
}

/**
 * Calculate trend score based on recent vs older marks
 */
async function calculateTrendScore(studentId) {
  const result = await db.query(
    `SELECT percentage, exam_date FROM marks 
     WHERE student_id = $1 ORDER BY exam_date DESC LIMIT 10`,
    [studentId]
  );
  if (result.rows.length < 2) return 70; // Neutral
  const recent = result.rows.slice(0, Math.ceil(result.rows.length / 2));
  const older = result.rows.slice(Math.ceil(result.rows.length / 2));
  const recentAvg = recent.reduce((s, r) => s + parseFloat(r.percentage), 0) / recent.length;
  const olderAvg = older.reduce((s, r) => s + parseFloat(r.percentage), 0) / older.length;
  const trendDiff = recentAvg - olderAvg;
  // Positive trend = higher score
  return Math.min(100, Math.max(0, 70 + trendDiff));
}

/**
 * Determine risk level from composite score
 */
function getRiskLevel(score) {
  if (score >= 75) return 'low';
  if (score >= 55) return 'medium';
  return 'high';
}

/**
 * Generate AI insights based on scores
 */
function generateInsights(scores, studentName) {
  const insights = [];
  const { attendance, performance, assignment, trend } = scores;

  if (attendance < THRESHOLDS.attendance.medium) {
    insights.push({
      type: 'warning',
      category: 'attendance',
      message: `Critical attendance level at ${attendance}%. Minimum 75% required to appear in exams.`,
      severity: 'high',
    });
  } else if (attendance < THRESHOLDS.attendance.low) {
    insights.push({
      type: 'caution',
      category: 'attendance',
      message: `Attendance at ${attendance}% is below the recommended 85%. Needs improvement.`,
      severity: 'medium',
    });
  }

  if (performance < THRESHOLDS.performance.medium) {
    insights.push({
      type: 'warning',
      category: 'academics',
      message: `Academic performance at ${performance}% is critically low. Immediate intervention required.`,
      severity: 'high',
    });
  } else if (performance < THRESHOLDS.performance.low) {
    insights.push({
      type: 'caution',
      category: 'academics',
      message: `Performance at ${performance}% is below average. Additional study sessions recommended.`,
      severity: 'medium',
    });
  }

  if (assignment < THRESHOLDS.assignment.medium) {
    insights.push({
      type: 'warning',
      category: 'assignments',
      message: `Only ${assignment}% of assignments submitted. Missing assignments affect final grades significantly.`,
      severity: 'high',
    });
  } else if (assignment < THRESHOLDS.assignment.low) {
    insights.push({
      type: 'caution',
      category: 'assignments',
      message: `Assignment completion at ${assignment}%. Ensure all pending submissions are completed.`,
      severity: 'medium',
    });
  }

  if (trend < 60) {
    insights.push({
      type: 'warning',
      category: 'trend',
      message: 'Declining performance trend detected. Recent scores are lower than historical averages.',
      severity: 'medium',
    });
  } else if (trend > 80) {
    insights.push({
      type: 'success',
      category: 'trend',
      message: 'Excellent upward performance trend! Keep up the great work.',
      severity: 'low',
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'success',
      category: 'overall',
      message: 'Excellent overall performance! Student is on track academically.',
      severity: 'low',
    });
  }

  return insights;
}

/**
 * Generate improvement suggestions
 */
function generateSuggestions(scores, riskLevel) {
  const suggestions = [];
  const { attendance, performance, assignment } = scores;

  if (attendance < 85) {
    suggestions.push('Maintain regular class attendance — target at least 85% attendance.');
    suggestions.push('Inform the teacher in advance for planned absences and submit leave applications.');
  }
  if (performance < 70) {
    suggestions.push('Schedule one-on-one sessions with subject teachers for doubts and concept clarity.');
    suggestions.push('Practice previous year question papers and take mock tests weekly.');
    suggestions.push('Form study groups with high-performing peers for collaborative learning.');
  }
  if (assignment < 80) {
    suggestions.push('Create a daily assignment tracker and set personal deadlines 2 days before the due date.');
    suggestions.push('Review assignment instructions carefully and seek clarification early.');
  }
  if (riskLevel === 'high') {
    suggestions.push('Enroll in remedial classes or tutoring programs immediately.');
    suggestions.push('Meet with your academic counselor to create a personalized improvement plan.');
    suggestions.push('Set aside at least 3 hours of focused study time daily.');
  }
  if (riskLevel === 'medium') {
    suggestions.push('Review your time management strategy and create a weekly study schedule.');
    suggestions.push('Utilize library resources, online courses, and academic support services.');
  }
  if (riskLevel === 'low') {
    suggestions.push('Continue your excellent work and consider taking on leadership roles in study groups.');
    suggestions.push('Explore advanced coursework, projects, or research opportunities.');
  }

  return suggestions;
}

/**
 * Main: Analyze a single student
 */
async function analyzeStudent(studentId) {
  const [attendanceScore, performanceScore, assignmentScore, trendScore] = await Promise.all([
    calculateAttendanceScore(studentId),
    calculatePerformanceScore(studentId),
    calculateAssignmentScore(studentId),
    calculateTrendScore(studentId),
  ]);

  const riskScore = Math.round(
    attendanceScore * WEIGHTS.attendance +
    performanceScore * WEIGHTS.performance +
    assignmentScore * WEIGHTS.assignment +
    trendScore * WEIGHTS.trend
  );

  const riskLevel = getRiskLevel(riskScore);
  const scores = { attendance: attendanceScore, performance: performanceScore, assignment: assignmentScore, trend: trendScore };
  const insights = generateInsights(scores, '');
  const suggestions = generateSuggestions(scores, riskLevel);

  // Upsert into ai_analysis table
  await db.query(
    `INSERT INTO ai_analysis (student_id, risk_level, risk_score, attendance_score, performance_score, assignment_score, insights, suggestions, analyzed_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
     ON CONFLICT (student_id) DO UPDATE SET
       risk_level=$2, risk_score=$3, attendance_score=$4, performance_score=$5,
       assignment_score=$6, insights=$7, suggestions=$8, analyzed_at=NOW()`,
    [studentId, riskLevel, riskScore, attendanceScore, performanceScore, assignmentScore, JSON.stringify(insights), JSON.stringify(suggestions)]
  );

  // Auto-generate notification for high-risk students
  if (riskLevel === 'high') {
    const studentResult = await db.query(
      `SELECT s.id, u.id as user_id, u.name FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1`,
      [studentId]
    );
    if (studentResult.rows.length > 0) {
      const student = studentResult.rows[0];
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type) 
         VALUES ($1,$2,$3,$4)`,
        [student.user_id, '⚠️ AI Risk Alert', `Your academic risk level has been flagged as HIGH (Score: ${riskScore}%). Please review your performance immediately.`, 'ai_alert']
      );
    }
  }

  return { riskLevel, riskScore, scores, insights, suggestions };
}

/**
 * Analyze all students (batch)
 */
async function analyzeAllStudents() {
  const result = await db.query('SELECT id FROM students');
  const analyses = await Promise.all(result.rows.map(r => analyzeStudent(r.id)));
  return analyses;
}

/**
 * Get cached analysis for a student
 */
async function getStudentAnalysis(studentId) {
  const result = await db.query(
    'SELECT * FROM ai_analysis WHERE student_id = $1',
    [studentId]
  );
  if (result.rows.length === 0) {
    return analyzeStudent(studentId);
  }
  return result.rows[0];
}

module.exports = { analyzeStudent, analyzeAllStudents, getStudentAnalysis };
