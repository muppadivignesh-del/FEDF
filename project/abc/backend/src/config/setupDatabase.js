require('dotenv').config();
const { pool } = require('./database');
const bcrypt = require('bcryptjs');

const schema = `
-- =============================================
-- EduTrack AI - Database Schema
-- =============================================

-- Users Table (base for all roles)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  avatar VARCHAR(500),
  phone VARCHAR(20),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  credits INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teachers Table (extends users)
CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  qualification VARCHAR(200),
  department VARCHAR(150),
  joining_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teacher-Subject assignments
CREATE TABLE IF NOT EXISTS teacher_subjects (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  academic_year VARCHAR(20) DEFAULT '2024-25',
  UNIQUE(teacher_id, subject_id, academic_year)
);

-- Students Table (extends users)
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  roll_number VARCHAR(30),
  class VARCHAR(50),
  section VARCHAR(10),
  semester INTEGER DEFAULT 1,
  academic_year VARCHAR(20) DEFAULT '2024-25',
  parent_name VARCHAR(150),
  parent_phone VARCHAR(20),
  date_of_birth DATE,
  admission_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student-Subject enrollments
CREATE TABLE IF NOT EXISTS student_subjects (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  academic_year VARCHAR(20) DEFAULT '2024-25',
  UNIQUE(student_id, subject_id, academic_year)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES teachers(id),
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, subject_id, date)
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  due_date TIMESTAMP NOT NULL,
  total_marks INTEGER DEFAULT 100,
  file_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_url VARCHAR(500),
  marks_obtained INTEGER,
  feedback TEXT,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late', 'missing')),
  UNIQUE(assignment_id, student_id)
);

-- Marks / Grades Table
CREATE TABLE IF NOT EXISTS marks (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES teachers(id),
  exam_type VARCHAR(50) NOT NULL CHECK (exam_type IN ('quiz', 'midterm', 'final', 'assignment', 'project')),
  marks_obtained NUMERIC(5,2) NOT NULL,
  total_marks NUMERIC(5,2) NOT NULL DEFAULT 100,
  percentage NUMERIC(5,2) GENERATED ALWAYS AS (ROUND((marks_obtained / total_marks * 100), 2)) STORED,
  exam_date DATE DEFAULT CURRENT_DATE,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  is_broadcast BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  parent_id INTEGER REFERENCES messages(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'ai_alert')),
  is_read BOOLEAN DEFAULT false,
  link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Analysis Cache Table
CREATE TABLE IF NOT EXISTS ai_analysis (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_score NUMERIC(5,2),
  attendance_score NUMERIC(5,2),
  performance_score NUMERIC(5,2),
  assignment_score NUMERIC(5,2),
  insights JSONB,
  suggestions JSONB,
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id)
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  generated_by INTEGER NOT NULL REFERENCES users(id),
  data JSONB,
  file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_role VARCHAR(20) CHECK (target_role IN ('all', 'student', 'teacher')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_marks_student ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_student ON ai_analysis(student_id);
`;

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('🚀 Setting up EduTrack database...');
    await client.query(schema);
    console.log('✅ Schema created successfully');

    // Create default admin
    const adminExists = await client.query("SELECT id FROM users WHERE email = 'admin@edutrack.com'");
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 12);
      const adminUser = await client.query(
        `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id`,
        ['System Admin', 'admin@edutrack.com', hashedPassword, 'admin']
      );

      // Seed subjects
      const subjects = [
        ['Mathematics', 'MATH101', 'Advanced Mathematics', 4],
        ['Physics', 'PHY101', 'Engineering Physics', 3],
        ['Chemistry', 'CHEM101', 'Applied Chemistry', 3],
        ['English', 'ENG101', 'Technical English', 2],
        ['Computer Science', 'CS101', 'Introduction to CS', 4],
        ['Data Structures', 'CS201', 'Data Structures & Algorithms', 4],
      ];
      for (const [name, code, desc, credits] of subjects) {
        await client.query(
          `INSERT INTO subjects (name, code, description, credits) VALUES ($1,$2,$3,$4) ON CONFLICT (code) DO NOTHING`,
          [name, code, desc, credits]
        );
      }

      // Seed demo teacher
      const teacherPwd = await bcrypt.hash('Teacher@123', 12);
      const teacherUser = await client.query(
        `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id`,
        ['Dr. Sarah Johnson', 'teacher@edutrack.com', teacherPwd, 'teacher']
      );
      await client.query(
        `INSERT INTO teachers (user_id, employee_id, qualification, department) VALUES ($1,$2,$3,$4)`,
        [teacherUser.rows[0].id, 'EMP001', 'Ph.D Computer Science', 'Computer Science']
      );

      // Seed demo student
      const studentPwd = await bcrypt.hash('Student@123', 12);
      const studentUser = await client.query(
        `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id`,
        ['Alex Thompson', 'student@edutrack.com', studentPwd, 'student']
      );
      await client.query(
        `INSERT INTO students (user_id, student_id, roll_number, class, section, semester) VALUES ($1,$2,$3,$4,$5,$6)`,
        [studentUser.rows[0].id, 'STU001', 'R001', 'B.Tech CSE', 'A', 3]
      );

      console.log('✅ Default accounts seeded:');
      console.log('   Admin:   admin@edutrack.com / Admin@123');
      console.log('   Teacher: teacher@edutrack.com / Teacher@123');
      console.log('   Student: student@edutrack.com / Student@123');
    } else {
      console.log('ℹ️  Database already seeded');
    }

    console.log('✅ Database setup complete!');
  } catch (err) {
    console.error('❌ Database setup error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
