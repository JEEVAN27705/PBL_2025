// src/panels/admin/DocumentPreview.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  'http://localhost:5000';

export default function DocumentPreview() {
  const { id } = useParams();
  const { state } = useLocation();
  const title = state?.title || 'Document Preview';

  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const [hover, setHover] = useState(false);

  useEffect(() => {
    let revoke;
    (async () => {
      try {
        setErr('');
        const token = localStorage.getItem('accessToken') || '';
        const res = await fetch(
          `${API_BASE.replace(/\/+$/, '')}/api/docs/${id}/preview`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: 'include' }
        );
        if (!res.ok) throw new Error(`Preview failed: ${res.status}`);
        const blob = await res.blob();
        const u = URL.createObjectURL(blob);
        setUrl(u);
        revoke = () => URL.revokeObjectURL(u);
      } catch (e) {
        setErr(e.message || 'Preview failed');
      }
    })();
    return () => { revoke && revoke(); };
  }, [id]);

  const header = { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 };
  const iconLink = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 8,
    color: hover ? '#93c5fd' : '#bfdbfe',
    background: hover ? 'rgba(59,130,246,0.08)' : 'transparent',
    border: hover ? '1px solid #3b82f6' : '1px solid transparent',
    transition: 'background 160ms ease, color 160ms ease, border-color 160ms ease',
    textDecoration: 'none',
    outline: 'none',
    fontSize: 18,
    lineHeight: 1,
    userSelect: 'none'
  };
  const titleRow = { margin: 0, fontSize: 20, color: '#e5e7eb' };
  const fileName = { marginLeft: 8, color: '#60a5fa', fontWeight: 600 };

  return (
    <div style={{ padding: 16 }}>
      <div style={header}>
        <Link
          to="/admin/view"
          aria-label="Go back"
          style={iconLink}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          className="icon-back"
        >
          {/* Leftwards arrow (U+2190) */}
          <span aria-hidden="true">←</span>
        </Link>

        <h2 style={titleRow}>
          File name:- <span style={fileName}>{title}</span>
        </h2>
      </div>

      {err && <div style={{ color: '#fca5a5', marginBottom: 8 }}>{err}</div>}

      <div style={{ border: '1px solid #ddd', height: '80vh' }}>
        {url ? (
          <iframe title="PDF Preview" src={url} width="100%" height="100%" style={{ border: 'none' }} />
        ) : (
          <div style={{ color: '#e5e7eb', padding: 24 }}>Loading…</div>
        )}
      </div>

      <style>{`
        .icon-back:focus-visible {
          outline: 3px solid #3b82f6;
          outline-offset: 3px;
        }
      `}</style>
    </div>
  );
}
