import React, { useState, useEffect } from 'react';
import './settings.css';

const API_BASE =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
    'http://localhost:5000';

export default function Settings() {
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Load initial user data
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const u = JSON.parse(userStr);
                setCurrentUser(u);
                setFullName(u.fullName || '');
            }
        } catch { }
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (!fullName.trim() && !password) {
            alert('No changes to save');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken') || '';
            const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/auth/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullName: fullName.trim(),
                    password: password ? password.trim() : undefined
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Update failed');

            alert('Settings updated successfully!');
            // Update local storage with new name
            if (data.user) {
                setCurrentUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                setFullName(data.user.fullName);
            }
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <h2 className="settings-title">Account Settings</h2>

            <div className="settings-card">
                <form onSubmit={handleUpdate} className="settings-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="form-divider"></div>

                    <h3 className="section-subtitle">Change Password</h3>
                    <p className="section-desc">Leave blank to keep your current password.</p>

                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="settings-info">
                <p><strong>Admin Scope:</strong> {currentUser?.adminScope ? currentUser.adminScope.toUpperCase() : 'N/A'}</p>
                <p><strong>Email:</strong> {currentUser?.email}</p>
            </div>
        </div>
    );
}
