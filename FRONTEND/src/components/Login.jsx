import React, { useRef, useState } from 'react';
import '../styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { loginRequest } from '../api/auth/login';
import CustomDropdown from './common/CustomDropdown';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const submitBtnRef = useRef(null);

  const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { usernameRef.current?.focus(); return; }
    if (!password) { passwordRef.current?.focus(); return; }
    if (!role) { alert('Please select a role'); return; }

    try {
      setLoading(true);
      const data = await loginRequest({ username, password, role });

      // Persist token if needed elsewhere
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      // CRITICAL: persist user for ProtectedRoute/UploadPage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      if (rememberMe) localStorage.setItem('remember', '1');
      else localStorage.removeItem('remember');

      if (data?.user?.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/user', { replace: true });
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onUsernameKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); passwordRef.current?.focus(); }
  };
  const onPasswordKeyDown = (e) => {
    if (e.key === 'Enter') { submitBtnRef.current?.click(); }
  };

  return (
    <div className="app">
      <main className="main-content">
        <div className="login-container">
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back</h1>
            <p className="welcome-subtitle">Sign in to continue your conversations.</p>
          </div>

          {error && <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>}

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <input
                ref={usernameRef}
                type="text"
                placeholder="Username or Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={onUsernameKeyDown}
                className="form-input"
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="form-group">
              <input
                ref={passwordRef}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onPasswordKeyDown}
                className="form-input"
                autoComplete="current-password"
              />
            </div>
            <div className="form-group">
              <CustomDropdown
                options={roleOptions}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Select role"
              />
            </div>
            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">Remember me</span>
              </label>
            </div>
            <button ref={submitBtnRef} type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="signup-section">
            <span className="signup-text">Don't have an account? </span>
            <Link className="signup-link" to="/register">Sign up</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
