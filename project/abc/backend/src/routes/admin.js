const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const admin = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/dashboard', admin.getDashboard);
router.get('/analytics', admin.getAnalytics);
router.post('/ai/analyze', admin.runAIAnalysis);

// Students
router.get('/students', admin.getStudents);
router.post('/students', admin.createStudent);
router.put('/students/:id', admin.updateStudent);
router.delete('/students/:id', admin.deleteStudent);

// Teachers
router.get('/teachers', admin.getTeachers);
router.post('/teachers', admin.createTeacher);
router.put('/teachers/:id', admin.updateTeacher);
router.delete('/teachers/:id', admin.deleteTeacher);

// Subjects
router.get('/subjects', admin.getSubjects);
router.post('/subjects', admin.createSubject);
router.put('/subjects/:id', admin.updateSubject);
router.delete('/subjects/:id', admin.deleteSubject);

module.exports = router;
