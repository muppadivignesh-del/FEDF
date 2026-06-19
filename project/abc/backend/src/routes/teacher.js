const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const tc = require('../controllers/teacherController');

router.use(protect, authorize('teacher'));

router.get('/dashboard', tc.getDashboard);
router.get('/students', tc.getMyStudents);
router.get('/analytics', tc.getClassAnalytics);

router.get('/attendance', tc.getAttendance);
router.post('/attendance', tc.markAttendance);

router.get('/assignments', tc.getMyAssignments);
router.post('/assignments', tc.createAssignment);
router.put('/assignments/grade/:id', tc.gradeSubmission);

router.post('/marks', tc.addMarks);

module.exports = router;
