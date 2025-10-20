import React, { useState } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import Sidebar from './Sidebar'
import '../styles/ChatArea.css'

const ChatArea = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'user',
      content: 'Hello! How can I assist you today?',
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'assistant',
      content:
        "I'm doing well, thank you for asking! I'm here to help you with any questions or tasks you might have. What's on your mind?",
      timestamp: new Date()
    }
  ])

  const sendMessage = (text) => {
    if (!text.trim()) return
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', content: text, timestamp: new Date() }
    ])
  }

  return (
    <div className="chat-shell">
      <Sidebar />
      <div className="chat-main">
        <MessageList messages={messages} />
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  )
}

export default ChatArea
