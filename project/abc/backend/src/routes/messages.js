const router = require('express').Router();
const { protect } = require('../middleware/auth');
const mc = require('../controllers/messageController');

router.use(protect);

router.get('/inbox', mc.getInbox);
router.get('/sent', mc.getSent);
router.post('/send', mc.sendMessage);
router.put('/:id/read', mc.markRead);
router.get('/contacts', mc.getContacts);

router.get('/notifications', mc.getNotifications);
router.put('/notifications/:id/read', mc.markNotificationRead);
router.put('/notifications/read-all', mc.markAllNotificationsRead);

router.get('/announcements', mc.getAnnouncements);
router.post('/announcements', mc.createAnnouncement);

module.exports = router;
