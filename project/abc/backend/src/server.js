require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// ─── Socket.IO for Real-time Messaging ───────────────────────────────────────
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });

  socket.on('private_message', ({ to, message }) => {
    io.to(`user_${to}`).emit('new_message', message);
  });

  socket.on('notification', ({ to, notification }) => {
    io.to(`user_${to}`).emit('new_notification', notification);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) { onlineUsers.delete(userId); break; }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 EduTrack AI Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = { app, io };
