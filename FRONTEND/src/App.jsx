import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Terms from './components/Terms.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

import ProtectedRoute from './ProtectedRoute.jsx';

import UserLayout from './panels/user/UserLayout.jsx';

import AdminLayout from './panels/admin/AdminLayout.jsx';
import UploadPage from './panels/admin/UploadPage.jsx';
import DocumentArchive from './panels/admin/DocumentArchive.jsx';
import PendingApprovals from './panels/admin/PendingApprovals.jsx';
import ViewStatus from './panels/admin/ViewStatus.jsx';

// NEW: import the preview page
import DocumentPreview from './panels/admin/DocumentPreview.jsx';
import Settings from './panels/admin/Settings.jsx';
import AdminDashboard from './panels/admin/AdminDashboard.jsx';
import UserSettings from './panels/user/UserSettings.jsx';
import AIChat from './panels/user/AIChat.jsx';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<Terms />} />

        {/* Protected Routes for both user and admin */}
        <Route element={<ProtectedRoute allow={['user', 'admin']} />}>
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="/user/settings" replace />} />
            <Route path="chat" element={<AIChat />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>
        </Route>

        {/* Protected Routes for admin only */}
        <Route element={<ProtectedRoute allow={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="pending" element={<PendingApprovals />} />
            <Route path="archive" element={<DocumentArchive />} />
            <Route path="settings" element={<Settings />} />
            <Route path="view" element={<ViewStatus />} />

            {/* NEW: PDF preview route */}
            <Route path="docs/:id/preview" element={<DocumentPreview />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
