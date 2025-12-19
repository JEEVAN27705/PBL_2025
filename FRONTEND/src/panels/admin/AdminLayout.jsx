import React, { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './admin.css';

import {
  FiHome, FiUpload, FiFolder, FiArchive, FiSettings, FiEye, FiLogOut, FiUser,
} from 'react-icons/fi';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  'http://localhost:5000';

export default function AdminLayout() {
  const [me, setMe] = useState({ fullName: '', email: '', avatarUrl: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken') || '';
        if (!token) { setLoading(false); return; }
        const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Profile load failed');
        const data = await res.json();
        if (!cancelled) {
          const u = data?.user || {};
          setMe({
            fullName: u.fullName || '',
            email: u.email || '',
            avatarUrl: u.avatarUrl || '',
          });
          // Sync to LS too
          localStorage.setItem('user', JSON.stringify(u));
        }
      } catch {
        if (!cancelled) setMe({ fullName: '', email: '', avatarUrl: '' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();

    // Listen for local updates
    const handleLocalUpdate = () => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setMe({
          fullName: u.fullName || '',
          email: u.email || '',
          avatarUrl: u.avatarUrl || '',
        });
      } catch { }
    };

    window.addEventListener('user-updated', handleLocalUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener('user-updated', handleLocalUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const displayName = loading ? 'Loading…' : (me.fullName || me.email || 'User');
  const hasAvatar = Boolean(me.avatarUrl && me.avatarUrl.trim());
  const avatarSrc = hasAvatar
    ? (me.avatarUrl.startsWith('http') ? me.avatarUrl : `${API_BASE.replace(/\/+$/, '')}${me.avatarUrl}`)
    : '';

  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <div
          className="admin-brand"
          style={{ cursor: 'pointer' }}
          title="Refresh"
          onClick={() => window.location.reload()}
        >
          Admin Panel
        </div>

        <NavLink to="" end className="admin-link">
          <FiHome className="nav-icon" />
          <span className="nav-text">Home</span>
        </NavLink>

        <NavLink to="upload" className="admin-link">
          <FiUpload className="nav-icon" />
          <span className="nav-text">Upload Documents</span>
        </NavLink>

        <NavLink to="view" className="admin-link">
          <FiEye className="nav-icon" />
          <span className="nav-text">View Status</span>
        </NavLink>

        <NavLink to="pending" className="admin-link">
          <FiFolder className="nav-icon" />
          <span className="nav-text">Pending Approve</span>
        </NavLink>

        <NavLink to="archive" className="admin-link">
          <FiArchive className="nav-icon" />
          <span className="nav-text">Document Archive</span>
        </NavLink>

        <NavLink to="settings" className="admin-link">
          <FiSettings className="nav-icon" />
          <span className="nav-text">Settings</span>
        </NavLink>

        <Link to="settings" className="admin-profile" title="Account Settings">
          {hasAvatar ? (
            <img className="profile-avatar" src={avatarSrc} alt="avatar" />
          ) : (
            <div className="profile-avatar placeholder" aria-label="default avatar">
              <FiUser className="avatar-icon" />
            </div>
          )}

          <div className="profile-text">
            <div className="profile-name">{displayName}</div>
          </div>
        </Link>

        <FiLogOut
          className="profile-action"
          aria-hidden="true"
          title="Logout"
          onClick={handleLogout}
        />
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
