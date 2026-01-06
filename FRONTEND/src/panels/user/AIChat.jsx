
import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiCpu, FiGlobe, FiAlertCircle } from 'react-icons/fi';
import './user.css'; // Assumes chat styles are here as verified

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || 'http://localhost:5000';

export default function AIChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('auto');
    const bottomRef = useRef(null);

    // Initial welcome message
    useEffect(() => {
        setMessages([
            {
                id: 'welcome',
                sender: 'ai',
                text: "Hello! I am your Multilingual Campus Assistant. I can answer questions about verified notices and circulars.\n\nYou can ask me things like:\n• \"When is the exam fees deadline?\"\n• \"Scholarship forms submission date?\"\n• \"Is the library open on Saturday?\"",
                sources: [],
                lang: 'en'
            }
        ]);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: input.trim(),
            lang: language
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/chat/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: userMsg.text,
                    language: language
                })
            });

            if (!res.ok) throw new Error('Failed to fetch response');

            const data = await res.json();

            const aiMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: data.response || "I'm sorry, I couldn't process that.",
                sources: data.sources || [],
                lang: data.original_language
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'error',
                text: "Sorry, I'm having trouble connecting to the server. Please try again later."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header-bar">
                <div>
                    <h2 className="chat-header">AI Assistant</h2>
                    <p className="chat-subheader">
                        <FiCpu style={{ marginRight: 6 }} />
                        Verified Campus Intelligence
                    </p>
                </div>

                <div className="language-selector">
                    <FiGlobe />
                    <label>Language:</label>
                    <select
                        className="language-dropdown"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="auto">Auto Detect</option>
                        <option value="en">English</option>
                        <option value="hi">Hindi (हिंदी)</option>
                        <option value="mr">Marathi (मराठी)</option>
                        <option value="gu">Gujarati (ગુજરાતી)</option>
                        <option value="ta">Tamil (தமிழ்)</option>
                    </select>
                </div>
            </div>

            <div className="chat-window">
                <div className="messages-list">
                    {messages.map(msg => (
                        <div key={msg.id} className={`message message-${msg.sender}`}>
                            <div className="message-header">
                                <span className="message-sender">
                                    {msg.sender === 'user' ? 'You' : 'Campus AI'}
                                </span>
                            </div>
                            <div className="message-content">
                                <div className="message-text">{msg.text}</div>

                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="message-sources">
                                        <div className="sources-header">Sources Verified:</div>
                                        <ul className="sources-list">
                                            {msg.sources.map((src, i) => (
                                                <li key={i} className="source-item">{src}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message message-ai">
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span className="spinner">⟳</span>
                                    <span>Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder={language === 'auto' ? "Ask anything..." : "Please type your query..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" className="chat-send-btn" disabled={loading || !input.trim()}>
                    <FiSend size={20} />
                </button>
            </form>

            <div className="chat-footer">
                AI can make mistakes. Please check verified documents for critical info.
            </div>
        </div>
    );
}
