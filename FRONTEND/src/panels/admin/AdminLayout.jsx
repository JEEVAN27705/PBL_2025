import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './admin.css';

// Feather icons
import { FiHome, FiUpload, FiFolder, FiArchive, FiSettings } from 'react-icons/fi';

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-nav">
      <div className="admin-brand"
        style={{ cursor: 'pointer' }}
        title="Refresh"
        onClick={() => window.location.reload()}> Admin Panel
      </div>

        <NavLink to="" end className="admin-link">
          <FiHome className="nav-icon" />
          <span className="nav-text">Home</span>
        </NavLink>

        <NavLink to="upload" className="admin-link">
          <FiUpload className="nav-icon" />
          <span className="nav-text">Upload Documents</span>
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

        <button className="logout">Logout</button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
