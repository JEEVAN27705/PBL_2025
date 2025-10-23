import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import { signAccessToken, setAuthCookie } from '../utils/tokens.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, passwordHash, role });

    const token = signAccessToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      accessToken: token
    });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const identifier = email || username;
    if (!identifier || !password || !role) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }]
    });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.role !== role) return res.status(403).json({ message: 'Role mismatch' });

    const token = signAccessToken(user);
    setAuthCookie(res, token);

    return res.json({
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      accessToken: token
    });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict' });
  return res.json({ message: 'Logged out' });
});

router.get('/me', auth, (req, res) => {
  return res.json({ user: req.user });
});

router.get('/admin/ping', auth, authorize(['admin']), (req, res) => {
  return res.json({ ok: true, role: 'admin' });
});

export default router;
