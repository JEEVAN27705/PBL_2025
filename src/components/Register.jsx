import React, { useRef, useState } from 'react'
import '../styles/Login.css'
import { Link } from 'react-router-dom'
import logo from '../assets/Logo.jpeg'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTos, setAgreeTos] = useState(false)
  const [role, setRole] = useState('')  // ✅ Added this line

  const fullNameRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const confirmRef = useRef(null)
  const submitBtnRef = useRef(null)

  const handleRegister = (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      fullNameRef.current?.focus()
      return
    }
    if (!email.trim()) {
      emailRef.current?.focus()
      return
    }
    if (!password) {
      passwordRef.current?.focus()
      return
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      confirmRef.current?.focus()
      return
    }
    console.log('Register attempted with:', {
      fullName,
      email,
      password,
      role,
      agreeTos
    })
    // TODO: call your signup API here
  }

  const onFullNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      emailRef.current?.focus()
    }
  }

  const onEmailKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      passwordRef.current?.focus()
    }
  }

  const onPasswordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      confirmRef.current?.focus()
    }
  }

  const onConfirmKeyDown = (e) => {
    if (e.key === 'Enter') {
      submitBtnRef.current?.click()
    }
  }

  const handleGoogle = () => console.log('Google signup clicked')
  const handleFacebook = () => console.log('Facebook signup clicked')

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
                checked={agreeTos}
                onChange={(e) => setAgreeTos(e.target.checked)}
                className="checkbox-input"
              />
              
             <span className="checkbox-custom"></span>
             <span className="checkbox-label"> I agree to the{' '}
      
              <Link to="/terms" className="link"> Terms of Service </Link>
              </span>
             </label>
            <span style={{ visibility: 'hidden' }} className="forgot-password"> placeholder </span>
          </div>

            <button ref={submitBtnRef} type="submit" className="login-button">
              Sign up
            </button>
          </form>

          <div className="divider">
            <span className="divider-text">Or continue with</span>
          </div>

          <div className="social-buttons">
            <button className="social-button google-button" onClick={handleGoogle}>
              <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            <button className="social-button facebook-button" onClick={handleFacebook}>
              <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <div className="signup-section">
            <span className="signup-text">Already Have an Account?</span>
            <Link className="signup-link" to="/login">Log In</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
