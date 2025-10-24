// src/api/auth/register.js

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
    ? import.meta.env.VITE_API_BASE
    : 'http://localhost:5000';

function buildUrl(path) {
  return `${API_BASE.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

export async function registerRequest({ fullName, email, password, role, adminScope }) {
  const payload = { fullName, email, password, role };
  if (role === 'admin' && adminScope) payload.adminScope = adminScope;

  const url = buildUrl('/api/auth/register');

  // Helpful during 404/500 debugging
  if (import.meta?.env?.MODE !== 'production') {
    console.log('POST', url, payload);
  }

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  } catch (e) {
    throw new Error(`Network error contacting ${url}: ${e?.message || e}`);
  }

  const text = await res.text().catch(() => '');
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch { /* non-JSON body */ } }

  if (!res.ok) {
    const msg = data?.message || data?.error || `Registration failed (${res.status})`;
    throw new Error(msg);
  }

  return data || {};
}
