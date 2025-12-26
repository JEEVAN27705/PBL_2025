import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiAlertCircle, FiCheckCircle, FiBook, FiLoader } from 'react-icons/fi';
import './user.css';

const AI_SERVICE_URL = 'http://localhost:3001';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: inputText,
          language: selectedLanguage,
          maxResults: 5
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response');
      }

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: data.data.answer,
        sources: data.data.sources || [],
        confidence: data.data.confidence,
        language: data.data.language,
        processingTime: data.processingTime,
        timestamp: new Date(),
        metadata: data.data.metadata
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Query error:', err);
      setError(err.message);

      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: `Error: ${err.message}. Please make sure the AI service is running on ${AI_SERVICE_URL}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const languages = [
    { code: 'auto', name: 'Auto-detect' },
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'de', name: 'Deutsch (German)' }
  ];

  return (
    <div className="chat-container">
      <div className="chat-header-bar">
        <div>
          <h2 className="chat-header">Ask Questions About Verified Documents</h2>
          <p className="chat-subheader">
            <FiCheckCircle style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            All answers are based exclusively on verified documents from the admin panel
          </p>
        </div>
        <div className="language-selector">
          <label htmlFor="lang-select">Language:</label>
          <select
            id="lang-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-dropdown"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="chat-window">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="welcome-icon">
              <FiBook size={48} />
            </div>
            <h3>Welcome to Document Q&A</h3>
            <p>Ask questions and get answers from verified documents</p>
            <div className="example-questions">
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>Try asking:</p>
              <ul>
                <li>"What is the 7 states model of process?"</li>
                <li>"Explain the account verification process"</li>
                <li>"What are the HR policies?"</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message.id} className={`message message-${message.type}`}>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">
                      {message.type === 'user' ? 'You' : message.type === 'error' ? 'Error' : 'AI Assistant'}
                    </span>
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-text">{message.text}</div>

                  {message.type === 'ai' && message.sources && message.sources.length > 0 && (
                    <div className="message-sources">
                      <div className="sources-header">
                        <FiBook size={14} />
                        <span>Sources from verified documents:</span>
                      </div>
                      <ul className="sources-list">
                        {message.sources.map((source, idx) => (
                          <li key={idx} className="source-item">
                            <strong>{source.documentTitle}</strong>
                            {source.department && ` (${source.department})`}
                          </li>
                        ))}
                      </ul>
                      {message.confidence !== undefined && (
                        <div className="confidence-indicator">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </div>
                      )}
                      {message.processingTime && (
                        <div className="processing-time">
                          Processed in {message.processingTime}ms
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message message-ai">
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">AI Assistant</span>
                  </div>
                  <div className="message-text typing-indicator">
                    <FiLoader className="spinner" />
                    <span>Searching verified documents and generating answer...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          placeholder="Ask a question about the documents..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button
          className="chat-send-btn"
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? <FiLoader className="spinner" /> : <FiSend />}
        </button>
      </div>

      <div className="chat-footer">
        <FiAlertCircle style={{ marginRight: '4px', verticalAlign: 'middle' }} />
        AI responses are generated from verified documents only. Always verify critical information.
      </div>
    </div>
  );
}
