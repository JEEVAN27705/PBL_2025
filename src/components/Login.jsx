import React, { useRef, useState } from 'react'
import '../styles/Login.css'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/Logo.jpeg' // ensure file name & path are correct

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [role, setRole] = useState('') // ✅ Added missing state for role

  // Router navigation
  const navigate = useNavigate()

  // Refs to control focus and submit behavior
  const usernameRef = useRef(null)
  const passwordRef = useRef(null)
  const submitBtnRef = useRef(null)

  const handleLogin = (e) => {
    e.preventDefault()
    if (!username.trim()) { usernameRef.current?.focus(); return }
    if (!password) { passwordRef.current?.focus(); return }
    if (!role) { alert('Please select a role'); return }

    console.log('Login attempted with:', { username, password, role, rememberMe })
    navigate('/chat')
  }

  const onUsernameKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); passwordRef.current?.focus() }
  }

  const onPasswordKeyDown = (e) => {
    if (e.key === 'Enter') { submitBtnRef.current?.click() }
  }

  const handleGoogleLogin = () => console.log('Google login clicked')
  const handleFacebookLogin = () => console.log('Facebook login clicked')
  const handleForgotPassword = () => console.log('Forgot password clicked')

  return (
    <div className="app">
      <main className="main-content">
        <div className="login-container">

          {/* Centered brand logo */}
          <div className="brand-mark">
            <div className="brand-logo">
              <img src={logo} alt="App logo" />
            </div>
          </div>

          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back</h1>
            <p className="welcome-subtitle">Sign in to continue your conversations.</p>
          </div>

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

            {/* ✅ Added missing role select functionality */}
            <div className="form-group">
              <select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-input"
                aria-label="Select role"
              >
                <option value="" disabled>Select role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
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
              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </div>

            {/* Visible submit button; clicked by Enter on password */}
            <button ref={submitBtnRef} type="submit" className="login-button">
              Login
            </button>
          </form>

          <div className="divider">
            <span className="divider-text">Or continue with</span>
          </div>

          <div className="social-buttons">
            <button className="social-button google-button" onClick={handleGoogleLogin}>
              <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            <button className="social-button facebook-button" onClick={handleFacebookLogin}>
              <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <div className="signup-section">
            <span className="signup-text">Don't have an account? </span>
            <Link className="signup-link" to="/register">Sign up</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
