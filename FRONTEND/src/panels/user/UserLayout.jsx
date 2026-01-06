import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMessageSquare, FiClock, FiBookmark, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import './user.css';
import ThemeToggle from '../../components/ThemeToggle';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || 'http://localhost:5000';

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ fullName: 'User', email: 'user@example.com', avatarUrl: '' });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
    } catch (e) {
      console.error('Failed to fetch user profile', e);
    }
  };

  useEffect(() => {
    // 1. Initial load from LS
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      if (u) setUser(u);
    } catch (e) { }

    // 2. Fresh fetch
    fetchProfile();

    // 3. Listen for updates from Settings
    const handleUpdate = () => {
      try {
        const u = JSON.parse(localStorage.getItem('user'));
        if (u) setUser(u);
      } catch (e) { }
    };

    window.addEventListener('user-updated', handleUpdate);
    return () => window.removeEventListener('user-updated', handleUpdate);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const navItems = [
    { label: 'AI Assistant', path: '/user/chat', icon: <FiMessageSquare /> },
    { label: 'Settings', path: '/user/settings', icon: <FiSettings /> },
  ];

  const avatarSrc = user.avatarUrl
    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE.replace(/\/+$/, '')}${user.avatarUrl}`)
    : null;

  return (
    <div className="user-shell">
      <aside className="user-sidebar">
        <div className="user-brand">
          <h2>GenZDreamers</h2>
        </div>

        <nav className="user-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/user' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`user-nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="user-profile-section">
          <Link to="settings" className="user-info" style={{ textDecoration: 'none', color: 'inherit' }} title="Account Settings">
            <div className={`user-avatar ${!avatarSrc ? 'placeholder' : ''}`}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="profile-img" />
              ) : (
                <FiUser />
              )}
            </div>
            <div className="user-details">
              <div className="user-name">{user.fullName || 'User'}</div>
              <div className="user-email">{user.email || 'user@example.com'}</div>
            </div>
          </Link>
          <button className="user-logout-btn" onClick={handleLogout} title="Logout">
            <FiLogOut />
          </button>
        </div>
      </aside>

      <main className="user-main">
        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
          <ThemeToggle />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
