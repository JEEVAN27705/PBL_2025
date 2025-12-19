import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMessageSquare, FiClock, FiBookmark, FiLogOut, FiUser } from 'react-icons/fi';
import './user.css';

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ fullName: 'User', email: 'user@example.com' });

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      if (u) setUser(u);
    } catch (e) {
      console.error('Failed to load user', e);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const navItems = [
    { label: 'Chat with AI', path: '/user', icon: <FiMessageSquare /> },
    { label: 'Conversation History', path: '/user/history', icon: <FiClock /> },
    { label: 'Saved Prompts', path: '/user/saved', icon: <FiBookmark /> },
  ];

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
          <div className="user-info">
            <div className="user-avatar">
              <FiUser />
            </div>
            <div className="user-details">
              <div className="user-name">{user.fullName || 'User'}</div>
              <div className="user-email">{user.email || 'user@example.com'}</div>
            </div>
          </div>
          <button className="user-logout-btn" onClick={handleLogout} title="Logout">
            <FiLogOut />
          </button>
        </div>
      </aside>

      <main className="user-main">
        <Outlet />
      </main>
    </div>
  );
}
