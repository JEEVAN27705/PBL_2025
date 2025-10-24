import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function ProtectedRoute({ allow }) {
  const [status, setStatus] = useState('loading'); // loading | ok | deny
  const [role, setRole] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
        if (!res.ok) throw new Error('unauthorized');
        const data = await res.json();
        if (cancelled) return;
        setRole(data.user?.role || null);
        setStatus(allow.includes(data.user?.role) ? 'ok' : 'deny');
      } catch {
        if (!cancelled) setStatus('deny');
      }
    })();
    return () => { cancelled = true; };
  }, [allow]);

  if (status === 'loading') return <div style={{ color: '#9aa4b2', padding: 24 }}>Checking access…</div>;
  if (status === 'deny') return <Navigate to="/login" replace />;
  return <Outlet context={{ role }} />;
}
