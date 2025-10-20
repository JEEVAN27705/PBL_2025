import React from 'react'
import '../styles/Sidebar.css'
import logo from '../assets/Logo.jpeg' 

const Sidebar = () => {
  const handleAvatarError = (e) => {
    e.currentTarget.src = 'https://dummyimage.com/40x40/e5e5e5/666666?text=User'
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="app-logo">
          <div className="logo-icon">
            <img src={logo} alt="App logo" className="logo-img" />
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-item active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Chat with AI</span>
        </div>

        <div className="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 8V4L8 8L12 8ZM12 8V12M12 8H16L12 4M12 8H8L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 12H7M17 12H21M12 3V7M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Conversation History</span>
        </div>

        <div className="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 14C19 14.5304 18.7893 15.0391 18.4142 15.4142C18.0391 15.7893 17.5304 16 17 16H5C4.46957 16 3.96086 15.7893 3.58579 15.4142C3.21071 15.0391 3 14.5304 3 14V10C3 9.46957 3.21071 8.96086 3.58579 8.58579C3.96086 8.21071 4.46957 8 5 8H17C17.5304 8 18.0391 8.21071 18.4142 8.58579C18.7893 8.96086 19 9.46957 19 10V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 21V16H8V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Saved Prompts</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <img
            src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
            alt="User avatar"
            className="user-avatar"
            onError={handleAvatarError}
          />
          <div className="user-info">
            <div className="user-name">TESTBOT</div>
            <div className="user-email">testbot@example.com</div>
          </div>
          <button className="settings-btn" type="button" aria-label="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5176 9 19.405C8.69838 19.2719 8.36381 19.2322 8.03941 19.291C7.71502 19.3498 7.41568 19.5045 7.18 19.735L7.12 19.795C6.93425 19.981 6.71368 20.1285 6.47088 20.2291C6.22808 20.3298 5.96783 20.3816 5.705 20.3816C5.44217 20.3816 5.18192 20.3298 4.93912 20.2291C4.69632 20.1285 4.47575 19.981 4.29 19.795C4.10405 19.6093 3.95653 19.3887 3.85588 19.1459C3.75523 18.9031 3.70343 18.6428 3.70343 18.38C3.70343 18.1172 3.75523 17.8569 3.85588 17.6141C3.95653 17.3713 4.10405 17.1507 4.29 16.965L4.35 16.905C4.58054 16.6693 4.73519 16.37 4.794 16.0456C4.85282 15.7212 4.81312 15.3866 4.68 15.085C4.55324 14.7892 4.34276 14.537 4.07447 14.3593C3.80618 14.1816 3.49179 14.0863 3.17 14.085H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
