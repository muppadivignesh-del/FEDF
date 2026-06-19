import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const token = localStorage.getItem('token');
    if (err.response?.status === 401 && !token?.startsWith('mock-')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Helper ──────────────────────────────────────────────────
const isMock = () => localStorage.getItem('token')?.startsWith('mock-');
const ok = (data) => Promise.resolve({ data });

// ─── Mock Demo Accounts ──────────────────────────────────────
const MOCK_USERS = {
  'admin@edutrack.com':   { password: 'Admin@123',   user: { id: 1, name: 'System Admin',      email: 'admin@edutrack.com',   role: 'admin',   avatar: null }, token: 'mock-admin-token-123' },
  'teacher@edutrack.com': { password: 'Teacher@123', user: { id: 2, name: 'Dr. Sarah Johnson', email: 'teacher@edutrack.com', role: 'teacher', avatar: null }, token: 'mock-teacher-token-456' },
  'student@edutrack.com': { password: 'Student@123', user: { id: 3, name: 'Alex Thompson',     email: 'student@edutrack.com', role: 'student', avatar: null }, token: 'mock-student-token-789' },
};

// ─── Mock Data ───────────────────────────────────────────────
// ─── Mutable In-Memory Stores (changes persist within session) ──
let mockStudents = [
  { id: 1, name: 'Alex Thompson',   email: 'alex@edu.com',   class: 'B.Tech CSE', section: 'A', student_id: 'STU001', semester: 3, roll_number: 'R001', is_active: true },
  { id: 2, name: 'Priya Sharma',    email: 'priya@edu.com',  class: 'B.Tech ECE', section: 'B', student_id: 'STU002', semester: 3, roll_number: 'R002', is_active: true },
  { id: 3, name: 'Rahul Verma',     email: 'rahul@edu.com',  class: 'B.Tech ME',  section: 'A', student_id: 'STU003', semester: 3, roll_number: 'R003', is_active: true },
  { id: 4, name: 'Sneha Patel',     email: 'sneha@edu.com',  class: 'B.Tech CSE', section: 'C', student_id: 'STU004', semester: 4, roll_number: 'R004', is_active: true },
  { id: 5, name: 'Arjun Mehta',     email: 'arjun@edu.com',  class: 'B.Tech IT',  section: 'A', student_id: 'STU005', semester: 2, roll_number: 'R005', is_active: false },
];
let nextStudentId = 6;

let mockTeachers = [
  { id: 1, name: 'Dr. Sarah Johnson', email: 'teacher@edutrack.com', employee_id: 'EMP001', department: 'Computer Science', qualification: 'Ph.D Computer Science', is_active: true },
  { id: 2, name: 'Prof. John Smith',  email: 'john@edu.com',         employee_id: 'EMP002', department: 'Mathematics',       qualification: 'M.Sc Mathematics',     is_active: true },
  { id: 3, name: 'Dr. Neha Gupta',    email: 'neha@edu.com',         employee_id: 'EMP003', department: 'Physics',           qualification: 'Ph.D Physics',         is_active: true },
];
let nextTeacherId = 4;

const getAdminDashboard = () => ({
  stats: { students: mockStudents.length, teachers: mockTeachers.length, subjects: 6, unreadMessages: 7 },
  riskDistribution: [
    { risk_level: 'low',    count: String(Math.max(0, mockStudents.length - 10)) },
    { risk_level: 'medium', count: '7' },
    { risk_level: 'high',   count: '3' },
  ],
  attendanceToday: { present: Math.round(mockStudents.length * 0.8), absent: Math.round(mockStudents.length * 0.2), total: mockStudents.length },
  recentStudents: [...mockStudents].reverse().slice(0, 5).map(s => ({ ...s, created_at: new Date().toISOString() })),
});

const MOCK_TEACHER_DASHBOARD = {
  stats: { myStudents: 42, mySubjects: 3, pendingAssignments: 5, todayClasses: 4 },
  recentAttendance: [
    { date: '2024-01-15', subject: 'Data Structures', present: 38, absent: 4, total: 42 },
    { date: '2024-01-14', subject: 'CS101',           present: 40, absent: 2, total: 42 },
    { date: '2024-01-13', subject: 'Data Structures', present: 35, absent: 7, total: 42 },
  ],
  assignmentSubmissions: [
    { title: 'Binary Trees Assignment', submitted: 35, total: 42, due_date: '2024-01-20' },
    { title: 'Sorting Algorithms Lab',  submitted: 28, total: 42, due_date: '2024-01-18' },
  ],
  atRiskStudents: [
    { name: 'Arjun Mehta',   attendance: 62, avg_marks: 45, risk_level: 'high'   },
    { name: 'Sneha Patel',   attendance: 71, avg_marks: 55, risk_level: 'medium' },
    { name: 'Rahul Verma',   attendance: 68, avg_marks: 52, risk_level: 'medium' },
  ],
};

const getStudentDashboard = () => {
  const subjectAttendance = [
    { subject: 'Mathematics',      present: 22, total: 26, percentage: 85 },
    { subject: 'Physics',          present: 24, total: 26, percentage: 92 },
    { subject: 'CS101',            present: 12, total: 26, percentage: 46 }, // Low attendance
    { subject: 'Data Structures',  present: 23, total: 26, percentage: 88 },
    { subject: 'English',          present: 25, total: 26, percentage: 96 },
    { subject: 'Chemistry',        present: 18, total: 26, percentage: 69 },
  ];

  const recentMarks = [
    { subject: 'Mathematics',     exam_type: 'midterm',    marks_obtained: 78, total_marks: 100, percentage: 78, exam_date: '2024-01-10' },
    { subject: 'Physics',         exam_type: 'quiz',       marks_obtained: 18, total_marks: 20,  percentage: 90, exam_date: '2024-01-08' },
    { subject: 'Data Structures', exam_type: 'assignment', marks_obtained: 45, total_marks: 50,  percentage: 90, exam_date: '2024-01-05' },
    { subject: 'CS101',           exam_type: 'midterm',    marks_obtained: 35, total_marks: 100, percentage: 35, exam_date: '2024-01-03' }, // Low marks
  ];

  // Dynamically calculate AI Suggestions
  let risk_score = 0;
  const suggestions = [];
  
  const lowMarks = recentMarks.filter(m => m.percentage < 50);
  if (lowMarks.length > 0) {
    risk_score += 40;
    lowMarks.forEach(m => suggestions.push(`URGENT: Review ${m.subject} fundamentals. Your last score was ${m.percentage}%.`));
    suggestions.push("Schedule a 1-on-1 session with your professor or TA immediately.");
  }

  const lowAtt = subjectAttendance.filter(a => a.percentage < 75);
  if (lowAtt.length > 0) {
    risk_score += 30;
    lowAtt.forEach(a => suggestions.push(`WARNING: Your attendance in ${a.subject} is ${a.percentage}%, which is below the 75% threshold.`));
  }

  if (risk_score === 0) {
    suggestions.push('Keep up the great work! Your academic performance is steady.');
    suggestions.push('Consider mentoring peers or taking advanced topics.');
  }

  const risk_level = risk_score >= 60 ? 'high' : risk_score >= 30 ? 'medium' : 'low';

  return {
    student: { name: 'Alex Thompson', student_id: 'STU001', class: 'B.Tech CSE', section: 'A', semester: 3 },
    stats: { attendancePercent: 79, cgpa: 7.2, pendingAssignments: 2, totalSubjects: 6 },
    subjectAttendance,
    recentMarks,
    aiAnalysis: { risk_level, risk_score, suggestions },
    performanceTrend: [
      { month: 'Aug', avg: 72 }, { month: 'Sep', avg: 75 }, { month: 'Oct', avg: 78 },
      { month: 'Nov', avg: 74 }, { month: 'Dec', avg: 65 }, { month: 'Jan', avg: 58 }, // Downward trend
    ],
  };
};

// ─── Auth ────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => {
    const mock = MOCK_USERS[data.email];
    if (mock) {
      if (mock.password === data.password)
        return ok({ token: mock.token, user: mock.user });
      return Promise.reject({ response: { data: { message: 'Invalid email or password' } } });
    }
    return api.post('/auth/login', data);
  },
  getMe: () => {
    if (isMock()) {
      const token = localStorage.getItem('token');
      const entry = Object.values(MOCK_USERS).find(m => m.token === token);
      return entry ? ok({ user: entry.user }) : Promise.reject({ response: { status: 401 } });
    }
    return api.get('/auth/me');
  },
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Admin ───────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: ()       => isMock() ? ok({ data: getAdminDashboard() }) : api.get('/admin/dashboard'),
  getAnalytics: ()       => isMock() ? ok({ data: getAdminDashboard() }) : api.get('/admin/analytics'),
  runAIAnalysis: ()      => isMock() ? ok({ message: 'AI analysis complete' }) : api.post('/admin/ai/analyze'),

  getStudents: ({ search, risk } = {}) => {
    if (!isMock()) return api.get('/admin/students', { params: { search, risk } });
    let list = [...mockStudents];
    if (search) list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));
    if (risk)   list = list.filter(s => s.risk_level === risk);
    return ok({ data: list, total: list.length });
  },
  createStudent: (data) => {
    if (!isMock()) return api.post('/admin/students', data);
    const newStudent = {
      ...data,
      id: nextStudentId,
      student_id: `STU${String(nextStudentId).padStart(3, '0')}`,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    mockStudents.push(newStudent);
    nextStudentId++;
    return ok({ data: newStudent });
  },
  updateStudent: (id, d) => {
    if (!isMock()) return api.put(`/admin/students/${id}`, d);
    const idx = mockStudents.findIndex(s => s.student_id === id || s.id === id);
    if (idx !== -1) mockStudents[idx] = { ...mockStudents[idx], ...d };
    return ok({ data: mockStudents[idx] });
  },
  deleteStudent: (id) => {
    if (!isMock()) return api.delete(`/admin/students/${id}`);
    mockStudents = mockStudents.filter(s => s.student_id !== id && s.id !== id);
    return ok({ message: 'Deleted' });
  },

  getTeachers: ()        => isMock() ? ok({ data: mockTeachers }) : api.get('/admin/teachers'),
  createTeacher: (data)  => {
    if (!isMock()) return api.post('/admin/teachers', data);
    const newTeacher = { ...data, id: nextTeacherId, employee_id: `EMP${String(nextTeacherId).padStart(3,'0')}`, is_active: true };
    mockTeachers.push(newTeacher);
    nextTeacherId++;
    return ok({ data: newTeacher });
  },
  updateTeacher: (id, d) => {
    if (!isMock()) return api.put(`/admin/teachers/${id}`, d);
    const idx = mockTeachers.findIndex(t => t.employee_id === id || t.id === id);
    if (idx !== -1) mockTeachers[idx] = { ...mockTeachers[idx], ...d };
    return ok({ data: mockTeachers[idx] });
  },
  deleteTeacher: (id) => {
    if (!isMock()) return api.delete(`/admin/teachers/${id}`);
    mockTeachers = mockTeachers.filter(t => t.employee_id !== id && t.id !== id);
    return ok({ message: 'Deleted' });
  },

  getSubjects: ()        => isMock() ? ok({ data: [
    { id: 1, name: 'Mathematics',     code: 'MATH101', credits: 4, is_active: true },
    { id: 2, name: 'Physics',         code: 'PHY101',  credits: 3, is_active: true },
    { id: 3, name: 'Chemistry',       code: 'CHEM101', credits: 3, is_active: true },
    { id: 4, name: 'English',         code: 'ENG101',  credits: 2, is_active: true },
    { id: 5, name: 'Computer Science',code: 'CS101',   credits: 4, is_active: true },
    { id: 6, name: 'Data Structures', code: 'CS201',   credits: 4, is_active: true },
  ]}) : api.get('/admin/subjects'),
  createSubject: (data)  => isMock() ? ok({ data: { ...data, id: Date.now() } }) : api.post('/admin/subjects', data),
  updateSubject: (id, d) => isMock() ? ok({ data: d }) : api.put(`/admin/subjects/${id}`, d),
  deleteSubject: (id)    => isMock() ? ok({ message: 'Deleted' }) : api.delete(`/admin/subjects/${id}`),
};

// ─── Teacher ─────────────────────────────────────────────────
export const teacherAPI = {
  getDashboard: ()       => isMock() ? ok({ data: MOCK_TEACHER_DASHBOARD }) : api.get('/teacher/dashboard'),
  getStudents: ()        => isMock() ? ok({ data: mockStudents }) : api.get('/teacher/students'),
  getAnalytics: ()       => isMock() ? ok({ data: MOCK_TEACHER_DASHBOARD }) : api.get('/teacher/analytics'),

  getAttendance: ()      => isMock() ? ok({ data: MOCK_TEACHER_DASHBOARD.recentAttendance }) : api.get('/teacher/attendance'),
  markAttendance: (data) => isMock() ? ok({ message: 'Attendance marked' }) : api.post('/teacher/attendance', data),

  getAssignments: ()     => isMock() ? ok({ data: MOCK_TEACHER_DASHBOARD.assignmentSubmissions }) : api.get('/teacher/assignments'),
  createAssignment: (d)  => isMock() ? ok({ data: d }) : api.post('/teacher/assignments', d),
  gradeSubmission: (id, d) => isMock() ? ok({ data: d }) : api.put(`/teacher/assignments/grade/${id}`, d),

  addMarks: (data)       => isMock() ? ok({ message: 'Marks added' }) : api.post('/teacher/marks', data),
};

// ─── Student ─────────────────────────────────────────────────
export const studentAPI = {
  getDashboard: ()       => isMock() ? ok({ data: getStudentDashboard() }) : api.get('/student/dashboard'),
  getAttendance: ()      => isMock() ? ok({ data: getStudentDashboard().subjectAttendance }) : api.get('/student/attendance'),
  getMarks: ()           => isMock() ? ok({ data: getStudentDashboard().recentMarks }) : api.get('/student/marks'),
  getAssignments: ()     => isMock() ? ok({ data: [
    { id: 1, title: 'Binary Trees Assignment', subject: 'Data Structures', due_date: '2024-01-20', status: 'pending'   },
    { id: 2, title: 'Essay on Networking',     subject: 'English',         due_date: '2024-01-18', status: 'submitted' },
  ]}) : api.get('/student/assignments'),
  submitAssignment: (d)  => isMock() ? ok({ message: 'Submitted' }) : api.post('/student/assignments/submit', d),
  getAIAnalysis: ()      => isMock() ? ok({ data: getStudentDashboard().aiAnalysis }) : api.get('/student/ai-analysis'),
  getPerformanceTrend: ()=> isMock() ? ok({ data: getStudentDashboard().performanceTrend }) : api.get('/student/performance-trend'),
};

// ─── Messages ────────────────────────────────────────────────
const MOCK_MSGS = [
  { id: 1, sender_name: 'Dr. Sarah Johnson', subject: 'Assignment Deadline Extended', body: 'The binary trees assignment deadline has been extended by 2 days.', is_read: false, created_at: new Date().toISOString() },
  { id: 2, sender_name: 'System Admin',      subject: 'Welcome to EduTrack AI',      body: 'Welcome! Your account is ready.', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
];
export const messageAPI = {
  getInbox: ()           => isMock() ? ok({ data: MOCK_MSGS }) : api.get('/messages/inbox'),
  getSent: ()            => isMock() ? ok({ data: [] }) : api.get('/messages/sent'),
  sendMessage: (data)    => isMock() ? ok({ message: 'Sent' }) : api.post('/messages/send', data),
  markRead: (id)         => isMock() ? ok({ message: 'Read' }) : api.put(`/messages/${id}/read`),
  getContacts: ()        => isMock() ? ok({ data: mockTeachers }) : api.get('/messages/contacts'),

  getNotifications: ()   => isMock() ? ok({ data: [
    { id: 1, title: 'New Assignment', message: 'Binary Trees Assignment posted', type: 'info',    is_read: false, created_at: new Date().toISOString() },
    { id: 2, title: 'AI Alert',       message: 'Chemistry attendance is below 75%', type: 'warning', is_read: false, created_at: new Date().toISOString() },
  ]}) : api.get('/messages/notifications'),
  markNotificationRead: (id)   => isMock() ? ok({}) : api.put(`/messages/notifications/${id}/read`),
  markAllNotificationsRead: () => isMock() ? ok({}) : api.put('/messages/notifications/read-all'),

  getAnnouncements: ()   => isMock() ? ok({ data: [
    { id: 1, title: 'Semester Exams Schedule', content: 'End-semester exams begin Feb 1st. Check the timetable.', created_at: new Date().toISOString(), target_role: 'all' },
    { id: 2, title: 'Holiday Notice',          content: 'Campus closed on Jan 26th for Republic Day.', created_at: new Date().toISOString(), target_role: 'all' },
  ]}) : api.get('/messages/announcements'),
  createAnnouncement: (d) => isMock() ? ok({ data: d }) : api.post('/messages/announcements', d),
};

export default api;
