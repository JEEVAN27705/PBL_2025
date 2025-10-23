// src/api/auth/register.js
const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:5000';

export async function registerRequest({ fullName, email, password, role }) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ fullName, email, password, role })
  });
  if (!res.ok) {
    let message = 'Registration failed';
    try { const data = await res.json(); if (data?.message) message = data.message; } catch {}
    throw new Error(message);
  }
  return res.json();
}
