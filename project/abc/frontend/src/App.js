import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Auth
import Login from './pages/auth/Login';

// Admin
import AdminDashboard   from './pages/admin/Dashboard';
import AdminStudents    from './pages/admin/Students';
import AdminTeachers    from './pages/admin/Teachers';
import AdminAnalytics   from './pages/admin/Analytics';
import AdminSubjects    from './pages/admin/Subjects';
import AdminReports     from './pages/admin/Reports';
import AIAnalysis       from './pages/admin/AIAnalysis';

// Teacher
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherMarks     from './pages/teacher/Marks';
import TeacherAIRisk    from './pages/teacher/AIRisk';
import TeacherAnalytics from './pages/teacher/Analytics';
import TeacherStudents  from './pages/teacher/Students';

// Student
import StudentDashboard  from './pages/student/Dashboard';
import StudentMarks      from './pages/student/Marks';
import StudentAttendance from './pages/student/Attendance';
import StudentAssignments from './pages/student/Assignments';
import StudentPerformance from './pages/student/Performance';
import StudentAIInsights  from './pages/student/AIInsights';

// Shared
import Messages       from './pages/shared/Messages';
import Notifications  from './pages/shared/Notifications';
import Announcements  from './pages/shared/Announcements';
import Profile        from './pages/shared/Profile';

// No more placeholders!

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultPaths = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };
    return <Navigate to={defaultPaths[user.role] || '/login'} replace />;
  }
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  const defaultPaths = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };
  return <Navigate to={defaultPaths[user.role] || '/login'} replace />;
}

const P = (allowedRoles) => ({ children }) => <ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>;
const Admin   = P(['admin']);
const Teacher = P(['teacher']);
const Student = P(['student']);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e1b4b', color: '#fff' } }} />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/"      element={<RootRedirect />} />

          {/* ── Admin ── */}
          <Route path="/admin/dashboard"    element={<Admin><AdminDashboard /></Admin>} />
          <Route path="/admin/analytics"    element={<Admin><AdminAnalytics /></Admin>} />
          <Route path="/admin/students"     element={<Admin><AdminStudents /></Admin>} />
          <Route path="/admin/teachers"     element={<Admin><AdminTeachers /></Admin>} />
          <Route path="/admin/subjects"     element={<Admin><AdminSubjects /></Admin>} />
          <Route path="/admin/ai-analysis"  element={<Admin><AIAnalysis /></Admin>} />
          <Route path="/admin/reports"      element={<Admin><AdminReports /></Admin>} />
          <Route path="/admin/messages"     element={<Admin><Messages /></Admin>} />
          <Route path="/admin/announcements"element={<Admin><Announcements /></Admin>} />
          <Route path="/admin/notifications"element={<Admin><Notifications /></Admin>} />
          <Route path="/admin/profile"      element={<Admin><Profile /></Admin>} />

          {/* ── Teacher ── */}
          <Route path="/teacher/dashboard"  element={<Teacher><TeacherDashboard /></Teacher>} />
          <Route path="/teacher/analytics"  element={<Teacher><TeacherAnalytics /></Teacher>} />
          <Route path="/teacher/students"   element={<Teacher><TeacherStudents /></Teacher>} />
          <Route path="/teacher/attendance" element={<Teacher><TeacherAttendance /></Teacher>} />
          <Route path="/teacher/assignments"element={<Teacher><TeacherAssignments /></Teacher>} />
          <Route path="/teacher/marks"      element={<Teacher><TeacherMarks /></Teacher>} />
          <Route path="/teacher/ai-risk"    element={<Teacher><TeacherAIRisk /></Teacher>} />
          <Route path="/teacher/messages"   element={<Teacher><Messages /></Teacher>} />
          <Route path="/teacher/notifications" element={<Teacher><Notifications /></Teacher>} />
          <Route path="/teacher/profile"    element={<Teacher><Profile /></Teacher>} />

          {/* ── Student ── */}
          <Route path="/student/dashboard"   element={<Student><StudentDashboard /></Student>} />
          <Route path="/student/marks"       element={<Student><StudentMarks /></Student>} />
          <Route path="/student/attendance"  element={<Student><StudentAttendance /></Student>} />
          <Route path="/student/assignments" element={<Student><StudentAssignments /></Student>} />
          <Route path="/student/performance" element={<Student><StudentPerformance /></Student>} />
          <Route path="/student/ai-insights" element={<Student><StudentAIInsights /></Student>} />
          <Route path="/student/messages"    element={<Student><Messages /></Student>} />
          <Route path="/student/announcements" element={<Student><Announcements /></Student>} />
          <Route path="/student/notifications" element={<Student><Notifications /></Student>} />
          <Route path="/student/profile"     element={<Student><Profile /></Student>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
