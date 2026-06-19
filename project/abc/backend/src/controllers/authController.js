const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !await bcrypt.compare(password, user.password))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.is_active)
      return res.status(401).json({ success: false, message: 'Account is deactivated' });

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Fetch role-specific data
    let profileData = {};
    if (user.role === 'student') {
      const s = await db.query('SELECT * FROM students WHERE user_id = $1', [user.id]);
      profileData = s.rows[0] || {};
    } else if (user.role === 'teacher') {
      const t = await db.query('SELECT * FROM teachers WHERE user_id = $1', [user.id]);
      profileData = t.rows[0] || {};
    }

    const token = signToken(user.id, user.role);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profile: profileData,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    let profileData = {};
    if (req.user.role === 'student') {
      const s = await db.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
      profileData = s.rows[0] || {};
    } else if (req.user.role === 'teacher') {
      const t = await db.query('SELECT * FROM teachers WHERE user_id = $1', [req.user.id]);
      profileData = t.rows[0] || {};
    }
    res.json({ success: true, user: { ...req.user, profile: profileData } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    await db.query(
      'UPDATE users SET name=$1, phone=$2, address=$3, updated_at=NOW() WHERE id=$4',
      [name, phone, address, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await db.query('SELECT password FROM users WHERE id=$1', [req.user.id]);
    const user = result.rows[0];
    if (!await bcrypt.compare(currentPassword, user.password))
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password=$1 WHERE id=$2', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
