import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './user.css';

export default function UserLayout() {
  return (
    <div className="user-shell">
      <aside className="user-sidebar">
        <div className="brand">ChatApp</div>
        <nav>
          <Link to="" className="nav-link">Chat with AI</Link>
          <Link to="history" className="nav-link">Conversation History</Link>
          <Link to="saved" className="nav-link">Saved Prompts</Link>
        </nav>
        <div className="user-profile">
          <div className="avatar">U</div>
          <div className="meta">
            <div className="name">User</div>
            <div className="email">user@example.com</div>
          </div>
        </div>
      </aside>
      <main className="user-main">
        <Outlet />
      </main>
    </div>
  );
}
