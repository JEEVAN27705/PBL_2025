import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login.jsx';
import Register from './components/Register.jsx';

import ProtectedRoute from './ProtectedRoute.jsx';

import UserLayout from './panels/user/UserLayout.jsx';
import ChatPage from './panels/user/ChatPage.jsx';

import AdminLayout from './panels/admin/AdminLayout.jsx';
import UploadPage from './panels/admin/UploadPage.jsx';
import DocumentArchive from './panels/admin/DocumentArchive.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute allow={['user', 'admin']} />}>
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<ChatPage />} />
          <Route path="history" element={<div style={{ color: '#e5e7eb', padding: 24 }}>History</div>} />
          <Route path="saved" element={<div style={{ color: '#e5e7eb', padding: 24 }}>Saved Prompts</div>} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allow={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div style={{ color: '#e5e7eb', padding: 24 }}>Admin Home</div>} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="pending" element={<div style={{ color: '#e5e7eb', padding: 24 }}>Pending Approve</div>} />
          <Route path="archive" element={<DocumentArchive />} />
          <Route path="settings" element={<div style={{ color: '#e5e7eb', padding: 24 }}>Settings</div>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
