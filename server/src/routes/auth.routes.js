// server/src/routes/auth.routes.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { auth } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import { signAccessToken, setAuthCookie } from '../utils/tokens.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    console.log('HIT /api/auth/register body:', req.body);
    const { fullName, email, password, role, adminScope } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (role === 'admin' && !adminScope) {
      return res.status(400).json({ message: 'Admin department is required' });
    }

    const Model = role === 'admin' ? Admin : User;
    const exists = await Model.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    const userData = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role
    };

    if (role === 'admin') {
      userData.adminScope = adminScope;
    }

    const user = await Model.create(userData);

    const token = signAccessToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, adminScope: user.adminScope },
      accessToken: token
    });
  } catch (e) {
    console.error('Register error:', e);
    const msg = e?.errors
      ? Object.values(e.errors).map(x => x.message).join(', ')
      : e?.message || 'Server error';
    return res.status(500).json({ message: msg });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const identifier = (email || username || '').toLowerCase().trim();
    if (!identifier || !password || !role) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const Model = role === 'admin' ? Admin : User;
    const user = await Model.findOne({ email: identifier });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    // In our split model, the role is fixed per collection, but we check for completeness
    if (user.role !== role) return res.status(403).json({ message: 'Role mismatch' });

    const token = signAccessToken(user);
    setAuthCookie(res, token);

    return res.json({
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, adminScope: user.adminScope },
      accessToken: token
    });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict' });
  return res.json({ message: 'Logged out' });
});

router.get('/me', auth, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const Model = req.user.role === 'admin' ? Admin : User;
    const me = await Model.findById(req.user.id).lean();
    if (!me) return res.status(404).json({ message: 'User not found' });

    return res.json({
      user: {
        id: String(me._id),
        fullName: me.fullName,
        email: me.email,
        role: me.role,
        adminScope: me.adminScope || null,
        avatarUrl: me.avatarUrl || ''
      }
    });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load user' });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const { fullName, password, email, adminScope } = req.body;
    const updates = {};
    const Model = req.user.role === 'admin' ? Admin : User;

    if (fullName && fullName.trim()) updates.fullName = fullName.trim();
    if (email && email.trim()) {
      const newEmail = email.toLowerCase().trim();
      // Check if email is already taken in the same collection
      const exists = await Model.findOne({ email: newEmail, _id: { $ne: req.user.id } });
      if (exists) return res.status(409).json({ message: 'Email already in use' });
      updates.email = newEmail;
    }

    if (req.user.role === 'admin' && adminScope) {
      if (['accounts', 'hod', 'exam'].includes(adminScope)) {
        updates.adminScope = adminScope;
      } else {
        return res.status(400).json({ message: 'Invalid department' });
      }
    }

    if (password && password.trim()) {
      updates.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No changes provided' });
    }

    const updatedUser = await Model.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).lean();

    return res.json({
      message: 'Profile updated',
      user: {
        id: String(updatedUser._id),
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        adminScope: updatedUser.adminScope,
        avatarUrl: updatedUser.avatarUrl || ''
      }
    });
  } catch (e) {
    console.error('Update profile error:', e);
    return res.status(500).json({ message: 'Update failed' });
  }
});

router.get('/admin/ping', auth, authorize(['admin']), (req, res) => {
  return res.json({ ok: true, role: 'admin' });
});

export default router;
