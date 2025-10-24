import React, { useRef, useState } from 'react';
import '../styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.jpeg';
import { registerRequest } from '../api/auth/register';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [agreeTos, setAgreeTos] = useState(false);
  const [role, setRole]         = useState('');
  const [adminScope, setAdminScope] = useState(''); // Department for admin only

  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const fullNameRef  = useRef(null);
  const emailRef     = useRef(null);
  const passwordRef  = useRef(null);
  const submitBtnRef = useRef(null);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) { fullNameRef.current?.focus(); return; }
    if (!email.trim())    { emailRef.current?.focus();    return; }
    if (!password)        { passwordRef.current?.focus(); return; }
    if (!role)            { alert('Select a role');        return; }

    // Require department (adminScope) only when role is admin
    if (role === 'admin' && !adminScope) {
      alert('Select Department');
      return;
    }

    if (!agreeTos) { alert('Please accept Terms of Service'); return; }

    try {
      setLoading(true);
      const payload = { fullName, email, password, role };
      if (role === 'admin') payload.adminScope = adminScope; // send department

      const data = await registerRequest(payload);

      // Store token if provided; some backends use cookies only
      const token = data?.accessToken || data?.token || null;
      if (token) localStorage.setItem('accessToken', token);

      // Prefer server role if available, else fall back to chosen role
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
  const onEmailKeyDown    = (e) => { if (e.key === 'Enter') { e.preventDefault(); passwordRef.current?.focus(); } };
  const onPasswordKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); submitBtnRef.current?.click(); } };

  return (
    <div className="app">
      <main className="main-content">
        <div className="login-container">
          <div className="brand-mark">
            <div className="brand-logo">
              <img src={logo} alt="App logo" />
            </div>
          </div>

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
                onChange={(e)=>setFullName(e.target.value)}
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
                onChange={(e)=>setEmail(e.target.value)}
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
                onChange={(e)=>setPassword(e.target.value)}
                onKeyDown={onPasswordKeyDown}
                className="form-input"
                autoComplete="new-password"
              />
            </div>

            {/* Role select */}
            <div className="form-group">
              <select
                name="role"
                value={role}
                onChange={(e)=>setRole(e.target.value)}
                className="form-input"
                aria-label="Select role"
              >
                <option value="" disabled>Select role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            {/* Department (admin only) */}
            {role === 'admin' && (
              <div className="form-group">
                <select
                  name="adminScope"
                  value={adminScope}
                  onChange={(e)=>setAdminScope(e.target.value)}
                  className="form-input"
                  aria-label="Select Department"
                >
                  <option value="" disabled>Select Department</option>
                  <option value="accounts">Accounts</option>
                  <option value="hod">HOD</option>
                  <option value="exam">Exam</option>
                </select>
              </div>
            )}

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={agreeTos}
                  onChange={(e)=>setAgreeTos(e.target.checked)}
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

          <div className="divider">
            <span className="divider-text">Or continue with</span>
          </div>

          <div className="social-buttons">
            <button className="social-button google-button" onClick={()=>{}}>Google</button>
            <button className="social-button facebook-button" onClick={()=>{}}>Facebook</button>
          </div>

          <div className="signup-section">
            <span className="signup-text">Already Have an Account?</span>
            <Link className="signup-link" to="/login">Log In</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
