import React from 'react'
import Message from './Message'
import '../styles/MessageList.css'

const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      <div className="messages-container">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>
    </div>
  )
}

export default MessageList
