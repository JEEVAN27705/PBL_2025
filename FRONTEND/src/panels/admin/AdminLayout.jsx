import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './admin.css';

// Feather icons
import { FiHome, FiUpload, FiFolder, FiArchive, FiSettings, FiEye, FiLogOut } from 'react-icons/fi';

export default function AdminLayout() {
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/100?img=5'
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

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

        {/* Profile section — no border, no effect */}
        <div className="admin-profile" title="User Profile">
          <img className="profile-avatar" src={user.avatar} alt="avatar" />
          <div className="profile-text">
            <div className="profile-name">{user.name}</div>
          </div>
          <FiLogOut
            className="profile-action"
            aria-hidden="true"
            title="Logout"
            onClick={handleLogout}
          />
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
