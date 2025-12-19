import React, { useRef, useState, useEffect } from 'react';
import '../styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { registerRequest } from '../api/auth/register';
import CustomDropdown from './common/CustomDropdown';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTos, setAgreeTos] = useState(false);
  const [role, setRole] = useState('');
  const [adminScope, setAdminScope] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const submitBtnRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user agreed on the Terms page
    const agreed = localStorage.getItem('termsAgreed');
    if (agreed === 'true') {
      setAgreeTos(true);
      localStorage.removeItem('termsAgreed'); // Clean up
    }
  }, []);

  const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' }
  ];

  const departmentOptions = [
    { label: 'Accounts', value: 'accounts' },
    { label: 'HOD', value: 'hod' },
    { label: 'Exam', value: 'exam' }
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) { fullNameRef.current?.focus(); return; }
    if (!email.trim()) { emailRef.current?.focus(); return; }
    if (!password) { passwordRef.current?.focus(); return; }
    if (!role) { alert('Select a role'); return; }

    if (role === 'admin' && !adminScope) {
      alert('Select Department');
      return;
    }

    if (!agreeTos) { alert('Please accept Terms of Service'); return; }

    try {
      setLoading(true);
      const payload = { fullName, email, password, role };
      if (role === 'admin') payload.adminScope = adminScope;

      const data = await registerRequest(payload);

      // Persist token if present
      const token = data?.accessToken || data?.token || null;
      if (token) localStorage.setItem('accessToken', token);

      // NEW: Persist the authenticated user object for later use
      if (data?.user) {
        try {
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch { }
      }

      // Prefer server role if present
      const nextRole = data?.user?.role || role;
      if (nextRole === 'admin') navigate('/admin', { replace: true });
      else navigate('/user', { replace: true });
    } catch (err) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const onFullNameKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); emailRef.current?.focus(); } };
  const onEmailKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); passwordRef.current?.focus(); } };
  const onPasswordKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); submitBtnRef.current?.click(); } };

  return (
    <div className="app">
      <main className="main-content">
        <div className="login-container">
          <div className="welcome-section">
            <h1 className="welcome-title">Create an account</h1>
          </div>

          {error && <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>}

          <form className="login-form" onSubmit={handleRegister}>
            <div className="form-group">
              <input
                ref={fullNameRef}
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onKeyDown={onFullNameKeyDown}
                className="form-input"
                autoComplete="name"
                autoFocus
              />
            </div>

            <div className="form-group">
              <input
                ref={emailRef}
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={onEmailKeyDown}
                className="form-input"
                autoComplete="email"
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
                autoComplete="new-password"
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

            {role === 'admin' && (
              <div className="form-group">
                <CustomDropdown
                  options={departmentOptions}
                  value={adminScope}
                  onChange={(e) => setAdminScope(e.target.value)}
                  placeholder="Select Department"
                />
              </div>
            )}

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={agreeTos}
                  onChange={(e) => setAgreeTos(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">
                  {' '}I agree to the <Link to="/terms" className="link">Terms of Service</Link>
                </span>
              </label>

              <span style={{ visibility: 'hidden' }} className="forgot-password"> placeholder </span>
            </div>

            <button ref={submitBtnRef} type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>

          <div className="signup-section">
            <span className="signup-text">Already Have an Account?</span>
            <Link className="signup-link" to="/login">Log In</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
