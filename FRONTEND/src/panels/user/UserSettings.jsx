import React, { useState, useEffect } from 'react';
import '../admin/settings.css'; // Reusing the same professional styles

const API_BASE =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
    'http://localhost:5000';

export default function UserSettings() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [pendingFile, setPendingFile] = useState(null);
    const [shouldRemovePhoto, setShouldRemovePhoto] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            // Load from local storage initially
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const u = JSON.parse(userStr);
                    if (isMounted) {
                        setCurrentUser(u);
                        setFullName(u.fullName || '');
                        setEmail(u.email || '');
                        setAvatarUrl(u.avatarUrl || '');
                    }
                }
            } catch { }

            // Fetch fresh data from server
            try {
                const token = localStorage.getItem('accessToken') || '';
                if (!token) return;
                const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted && data.user) {
                        setCurrentUser(data.user);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        setFullName(data.user.fullName);
                        setEmail(data.user.email);
                        setAvatarUrl(data.user.avatarUrl || '');
                        // Force layout update if needed
                        window.dispatchEvent(new Event('user-updated'));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };

        fetchProfile();
        return () => { isMounted = false; };
    }, []);

    const updateAuthUser = (userUpdates) => {
        const newUser = { ...currentUser, ...userUpdates };
        setCurrentUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        window.dispatchEvent(new Event('user-updated'));
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        setPendingFile(file);
        setShouldRemovePhoto(false);
    };

    const handlePhotoRemove = () => {
        setPreviewUrl('');
        setPendingFile(null);
        setShouldRemovePhoto(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken') || '';
            let finalAvatarUrl = avatarUrl;

            // 1. Photo Operations
            if (shouldRemovePhoto) {
                const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/avatar`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) finalAvatarUrl = '';
            } else if (pendingFile) {
                const formData = new FormData();
                formData.append('avatar', pendingFile);
                const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/avatar`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });
                const data = await res.json();
                if (res.ok) finalAvatarUrl = data.avatarUrl;
            }

            // 2. Profile Updates
            const payload = {
                fullName: fullName.trim(),
                email: email.trim(),
                password: password ? password.trim() : undefined
            };

            const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/auth/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Update failed');

            // 3. Success
            alert('Settings saved successfully!');
            const finalUser = {
                ...(data.user || {}),
                avatarUrl: finalAvatarUrl
            };

            updateAuthUser(finalUser);
            setAvatarUrl(finalUser.avatarUrl || '');
            setPreviewUrl('');
            setPendingFile(null);
            setShouldRemovePhoto(false);
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
            <div className="settings-card">
                <div className="photo-section">
                    <div className="photo-wrapper">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="settings-avatar" />
                        ) : (avatarUrl && !shouldRemovePhoto) ? (
                            <img src={`${API_BASE.replace(/\/+$/, '')}${avatarUrl}`} alt="Profile" className="settings-avatar" />
                        ) : (
                            <div className="settings-avatar-placeholder">
                                {fullName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {loading && <div className="photo-loader">Processing...</div>}
                    </div>
                    <div className="photo-actions">
                        <label className="btn-upload">
                            Change Photo
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                        </label>
                        {(previewUrl || (avatarUrl && !shouldRemovePhoto)) && (
                            <button type="button" className="btn-remove" onClick={handlePhotoRemove}>
                                Remove Photo
                            </button>
                        )}
                    </div>
                </div>

                <div className="form-divider" style={{ margin: '30px 0' }}></div>

                <form onSubmit={handleUpdate} className="settings-form">
                    <h3 className="section-subtitle">Profile Information</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter full name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                            />
                        </div>
                    </div>

                    <div className="form-divider"></div>

                    <h3 className="section-subtitle">Security</h3>
                    <p className="section-desc">Leave blank to keep current password.</p>

                    <div className="form-row">
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New password"
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Saving Update...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
