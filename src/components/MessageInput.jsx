import React, { useState } from 'react'
import '../styles/MessageInput.css'

const MessageInput = () => {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      // Handle message sending logic here
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  return (
    <div className="message-input-container">
      <div className="input-wrapper">
        <form onSubmit={handleSubmit} className="message-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="message-input"
          />
          <button type="submit" className="send-button" disabled={!message.trim()}>
            Send
          </button>
        </form>
      </div>
      <div className="disclaimer">
        GenZDreams ChatApp can make mistakes. Consider verifying important information.
      </div>
    </div>
  )
}

export default MessageInput
