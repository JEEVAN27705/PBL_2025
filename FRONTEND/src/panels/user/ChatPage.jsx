import React from 'react';

export default function ChatPage() {
  return (
    <div className="chat-container">
      <h2 className="chat-header">Chat with AI</h2>

      <div className="chat-window">
        {/* Messages interaction will go here */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569' }}>
          Start a conversation...
        </div>
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          placeholder="Type your message here..."
        />
        <button className="chat-send-btn">Send</button>
      </div>

      <div className="chat-footer">
        ChatApp can make mistakes. Consider checking important information.
      </div>
    </div>
  );
}
