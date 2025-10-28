// FRONTEND/src/panels/admin/ViewStatus.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './view-status.css';

// Emoji icons
const Eye = ({ title = 'View' }) => <span title={title} role="img" aria-label="view">👁️</span>;
const Download = ({ title = 'Download' }) => <span title={title} role="img" aria-label="download">⬇️</span>;
const Trash = ({ title = 'Delete' }) => <span title={title} role="img" aria-label="delete">🗑️</span>;

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  'http://localhost:5000';

const STATUS_OPTIONS = ['All', 'Verified', 'Pending', 'Rejected'];
const SORT_OPTIONS = [
  { key: 'date_desc', label: 'Newest first' },
  { key: 'date_asc', label: 'Oldest first' },
  { key: 'title_asc', label: 'Title A–Z' },
  { key: 'title_desc', label: 'Title Z–A' },
];

export default function ViewStatus() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [sortKey, setSortKey] = useState('date_desc'); // newest → oldest by upload date
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(id);
  }, [searchTerm]); // Debouncing prevents over-filtering while typing. [web:80]

  // Fetch data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('accessToken') || '';
        const res = await fetch(
          `${API_BASE.replace(/\/+$/, '')}/api/admin/view-status?mine=true`,
          {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setDocs(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []); // Standard fetch pattern with cleanup avoids setting state after unmount. [web:96]

  // Format strictly as YYYY-MM-DD (createdAt only)
  const formatDate = (v) => {
    if (!v) return '-';
    const d = new Date(v);
    if (isNaN(d.getTime())) return '-';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }; // Using native Date ensures consistent ISO-like formatting in UI. [web:96]

  // Filter + sort (use only createdAt for dates)
  const filtered = useMemo(() => {
    const norm = (val) => String(val || '').toLowerCase();
    let list = docs.slice();

    if (debouncedSearch) {
      const k = debouncedSearch;
      list = list.filter(d =>
        norm(d.title).includes(k) ||
        norm(d.type).includes(k) ||
        norm(d.status).includes(k) ||
        norm(d.requestedBy).includes(k) ||
        norm(d.verifiedBy).includes(k)
      );
    }

    if (status !== 'All') {
      list = list.filter(d => {
        const s = norm(d.status);
        return (status === 'Verified' && s === 'verified')
            || (status === 'Pending'  && s === 'pending')
            || (status === 'Rejected' && s === 'rejected');
      });
    }

    switch (sortKey) {
      case 'date_asc':
        list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'date_desc':
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'title_asc':
        list.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
        break;
      case 'title_desc':
        list.sort((a, b) => String(b.title || '').localeCompare(String(a.title || '')));
        break;
      default: break;
    }
    return list;
  }, [docs, debouncedSearch, status, sortKey]); // Memoization avoids unnecessary recomputation during typing. [web:80]

  // Navigate to in-app preview page instead of window.open
  const onView = (row) => {
    navigate(`/admin/docs/${row._id}/preview`, { state: { title: row.title } });
  }; // Client-side navigation keeps session and avoids popup blockers. [web:96]

  // Helper: parse filename from Content-Disposition, with safe fallback
  const getFilenameFromCD = (cd, fallback) => {
    if (!cd) return fallback || 'document.pdf';
    // filename*=UTF-8''encoded or filename="raw"
    const star = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(cd);
    if (star) {
      try { return decodeURIComponent(star[1]); } catch (_) { /* ignore */ }
    }
    const plain = /filename\s*=\s*\"?([^\";]+)\"?/i.exec(cd);
    if (plain) return plain[1];
    return fallback || 'document.pdf';
  }; // CD header supports filename and filename*, prefer filename* per MDN guidance. [web:86][web:89]

  // Robust downloader: fetch blob with auth, infer filename, trigger download
  const onDownload = async (row) => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(
        `${API_BASE.replace(/\/+$/, '')}/api/docs/${row._id}/download`,
        {
          method: 'GET',
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);

      const cd = res.headers.get('Content-Disposition');
      const suggestedName = getFilenameFromCD(
        cd,
        `${(row.title || 'document').replace(/[\\/:*?"<>|]/g, '_')}.pdf`
      );
      const blob = await res.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = suggestedName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 250);
    } catch (e) {
      alert(e?.message || 'Download failed');
    }
  }; // The anchor download attribute with a blob URL forces a save dialog and works cross-browser for same-origin content. [web:80][web:90]

  // Delete rule: Pending/Rejected => hard delete via API; Verified => UI-only removal
  const onDelete = async (row) => {
    const s = String(row.status || '').toLowerCase();
    if (!confirm(`Remove "${row.title}"?`)) return;

    // Always remove from screen as requested
    setDocs(prev => prev.filter(x => x._id !== row._id));

    // For verified, stop here (no DB delete)
    if (s === 'verified' || s === 'approved') return;

    // For pending/rejected, hard delete in DB
    try {
      const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/docs/${row._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` },
      });
      if (res.status === 204 || res.status === 404) return; // success or already gone [web:142]
      throw new Error(`Delete failed: ${res.status}`);
    } catch (e) {
      setError(e?.message || 'Delete failed');
    }
  }; // Enforces rule at client: verified never hard-deleted, only hidden in UI. [web:156][web:167]

  return (
    <div className="vs-page">
      <h1 className="vs-title">View Status</h1>

      {/* Toolbar */}
      <div className="vs-toolbar vs-toolbar-first">
        <input
          className="vs-search vs-search-first"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search documents"
        />

        <div className="vs-pill-select" data-placeholder="Filter by Type">
          <select
            aria-label="Filter by Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="vs-pill-select" data-placeholder="Sort by Date">
          <select
            aria-label="Sort by"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="vs-card">
        <table className="vs-table">
          <thead>
            <tr>
              <th className="vs-title-cell">DOCUMENT TITLE</th>
              <th className="vs-center">TYPE</th>
              <th className="vs-center">STATUS</th>
              <th className="vs-center">UPLOADED DATE</th>
              <th className="vs-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="vs-center" colSpan="5">Loading…</td></tr>}
            {error && !loading && <tr><td className="vs-center" colSpan="5">{error}</td></tr>}
            {!loading && !error && filtered.length === 0 && <tr><td className="vs-center" colSpan="5">No documents found.</td></tr>}

            {!loading && !error && filtered.map(doc => (
              <tr key={doc._id}>
                <td className="vs-title-cell">{doc.title || '-'}</td>
                <td className="vs-center">{doc.type || 'Other'}</td>
                <td className="vs-center"><StatusPill status={doc.status} /></td>
                <td className="vs-center">{formatDate(doc.createdAt)}</td>
                <td className="vs-center">
                  <button className="vs-action-btn" onClick={() => onView(doc)} aria-label="View"><Eye /></button>
                  <button className="vs-action-btn" onClick={() => onDownload(doc)} aria-label="Download"><Download /></button>
                  <button className="vs-action-btn danger" onClick={() => onDelete(doc)} aria-label="Delete"><Trash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const s = (status || 'Pending').toLowerCase();
  let cls = 'vs-pill pending';
  let text = 'Pending';
  if (s === 'verified' || s === 'approved') { cls = 'vs-pill verified'; text = 'Verified'; }
  else if (s === 'rejected') { cls = 'vs-pill rejected'; text = 'Rejected'; }
  return <span className={cls}>{text}</span>;
}
