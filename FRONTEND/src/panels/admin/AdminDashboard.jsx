// frontend/src/panels/admin/AdminDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || 'http://localhost:5000';

const Icons = {
    Users: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    Files: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
    ),
    Shield: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    ),
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    ),
    X: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
    ),
    Send: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
    ),
    MessageCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
    )
};

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showGuide, setShowGuide] = useState(false);
    const [guideResponse, setGuideResponse] = useState('');
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('accessToken') || '';
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                };

                const [statsRes, chatRes] = await Promise.all([
                    fetch(`${API_BASE.replace(/\/+$/, '')}/api/admin/stats`, { headers }),
                    fetch(`${API_BASE.replace(/\/+$/, '')}/api/chat`, { headers })
                ]);

                if (!statsRes.ok || !chatRes.ok) throw new Error('Failed to fetch data');

                const statsData = await statsRes.json();
                const chatData = await chatRes.json();

                setStats(statsData);
                setMessages(chatData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message || 'Failed to load dashboard');
                setLoading(false);
            }
        };
        fetchDashboardData();
        // Poll for new messages every 10 seconds
        const interval = setInterval(fetchDashboardData, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        try {
            const token = localStorage.getItem('accessToken') || '';
            const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: chatInput.trim() })
            });

            if (res.ok) {
                const newMsg = await res.json();
                setMessages([...messages, newMsg]);
                setChatInput('');
            }
        } catch (err) {
            console.error('Send error:', err);
        }
    };

    const handleGuideQuery = (query) => {
        const responses = {
            'upload': 'To upload a document, go to the "Upload Documents" tab in the sidebar. Select your files (PDF only), fill in the details, and hit Submit.',
            'process': 'Documents follow a 3-step process: Upload -> Department Verification -> Status Update. You can track this in "View Status".',
            'approve': 'As an admin, you can approve pending documents in the "Pending Approvals" section. Only documents for your specific department will be visible to you.',
            'contact': 'For technical support, please contact the IT helpdesk at ext-4444 or mention @admin in the community chat.'
        };
        setGuideResponse(responses[query] || 'I am here to help. Please select one of the options below.');
    };

    if (loading) return <div className="dashboard-container"><p>Loading Dashboard...</p></div>;

    const cards = [
        { label: 'Total Documents', value: stats.totalUploads, icon: <Icons.Files />, color: '#60a5fa' },
        { label: 'Pending Review', value: stats.pendingUploads, icon: <Icons.Clock />, color: '#fbbf24' },
        { label: 'Verified', value: stats.verifiedUploads, icon: <Icons.Check />, color: '#34d399' },
        { label: 'Rejected', value: stats.rejectedUploads, icon: <Icons.X />, color: '#f87171' }
    ];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>System Overview</h1>
                <p>Track document status and communicate with the team.</p>
            </header>

            <div className="stats-grid">
                {cards.map((card, idx) => (
                    <div key={idx} className="stat-card">
                        <div className="stat-icon" style={{ color: card.color, backgroundColor: `${card.color}15` }}>
                            {card.icon}
                        </div>
                        <div className="stat-info">
                            <span>{card.label}</span>
                            <h2>{card.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div className="activity-chat-container">
                <section className="activity-section">
                    <div className="section-header">
                        <h3>Recent activity</h3>
                        <Link to="/admin/archive" className="view-all-btn">View All</Link>
                    </div>
                    <div className="activity-list">
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((item) => (
                                <div key={item.id} className="activity-item">
                                    <div className="activity-avatar">
                                        {(item.uploadedBy || 'U')[0].toUpperCase()}
                                    </div>
                                    <div className="activity-content">
                                        <h4>{item.title}</h4>
                                        <p>By {item.uploadedBy} • {new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`status-badge status-${item.status}`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No recent activity.</p>
                        )}
                    </div>
                </section>

                <section className="chat-section">
                    <div className="section-header">
                        <h3>Community Chat</h3>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={msg._id || i} className={`chat-bubble ${msg.isPrivate ? 'private' : 'public'}`}>
                                <span className="sender">{msg.senderName} {msg.isPrivate ? '(Private)' : ''}</span>
                                <div className="content">{msg.content}</div>
                                <span className="time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <form className="chat-input-wrap" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Type a message (use @role for private)..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                        />
                        <button type="submit" className="chat-send-btn">
                            <Icons.Send />
                        </button>
                    </form>
                </section>
            </div>

            {/* Guide Chatbot */}
            <div className="guide-chatbot">
                {showGuide && (
                    <div className="guide-panel">
                        <h4>System Guide</h4>
                        <div className="guide-options">
                            <button className="guide-option" onClick={() => handleGuideQuery('upload')}>How to upload documents?</button>
                            <button className="guide-option" onClick={() => handleGuideQuery('process')}>What is the process?</button>
                            <button className="guide-option" onClick={() => handleGuideQuery('approve')}>How to approve/reject?</button>
                            <button className="guide-option" onClick={() => handleGuideQuery('contact')}>Who to contact for help?</button>
                        </div>
                        {guideResponse && <div className="guide-response">{guideResponse}</div>}
                    </div>
                )}
                <div className="guide-bubble" onClick={() => setShowGuide(!showGuide)}>
                    <Icons.MessageCircle />
                </div>
            </div>
        </div>
    );
}
