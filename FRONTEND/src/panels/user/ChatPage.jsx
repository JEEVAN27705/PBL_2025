import React from 'react';

const Icons = {
  Send: () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
    </svg>
  )
};

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
        <button className="chat-send-btn">
          <Icons.Send />
        </button>
      </div>

      <div className="chat-footer">
        ChatApp can make mistakes. Consider checking important information.
      </div>
    </div>
  );
}
