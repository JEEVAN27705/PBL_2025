import React from 'react'
import '../styles/Message.css'

const Message = ({ message }) => {
  const isUser = message.type === 'user'
  
  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-avatar">
        {isUser ? (
          <img 
            src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400" 
            alt="User avatar"
            onerror="this.src='https://dummyimage.com/40x40/e5e5e5/666666?text=User'"
            className="avatar-image"
          />
        ) : (
          <div className="assistant-avatar">
            <span>A</span>
          </div>
        )}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-sender">
            {isUser ? 'User' : 'Assistant'}
          </span>
        </div>
        <div className="message-text">
          {message.content}
        </div>
      </div>
    </div>
  )
}

export default Message
