const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const sc = require('../controllers/studentController');

router.use(protect, authorize('student'));

router.get('/dashboard', sc.getDashboard);
router.get('/attendance', sc.getAttendance);
router.get('/marks', sc.getMarks);
router.get('/assignments', sc.getAssignments);
router.post('/assignments/submit', sc.submitAssignment);
router.get('/ai-analysis', sc.getAIAnalysis);
router.get('/performance-trend', sc.getPerformanceTrend);

module.exports = router;
