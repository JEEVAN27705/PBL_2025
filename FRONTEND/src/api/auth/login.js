const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:5000';

export async function loginRequest({ username, password, role }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, role })
  });
  if (!res.ok) {
    let message = 'Login failed';
    try { const data = await res.json(); if (data?.message) message = data.message; } catch {}
    throw new Error(message);
  }
  return res.json();
}
