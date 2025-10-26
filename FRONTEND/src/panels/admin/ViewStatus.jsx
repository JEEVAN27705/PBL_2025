import React, { useEffect, useMemo, useState } from 'react';
import './view-status.css';

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
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [sortKey, setSortKey] = useState('date_desc');
  const [error, setError] = useState('');

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
  }, []);

  const filtered = useMemo(() => {
    const norm = (s) => String(s || '').toLowerCase();
    let list = docs.slice();

    if (q.trim()) {
      const k = norm(q);
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
        const s = String(d.status || '').toLowerCase();
        return (status === 'Verified' && s === 'verified')
            || (status === 'Pending'  && s === 'pending')
            || (status === 'Rejected' && s === 'rejected');
      });
    }

    switch (sortKey) {
      case 'date_asc':
        list.sort((a, b) =>
          new Date(a.updatedAt || a.approvedDate || a.createdAt || 0) -
          new Date(b.updatedAt || b.approvedDate || b.createdAt || 0)
        );
        break;
      case 'date_desc':
        list.sort((a, b) =>
          new Date(b.updatedAt || b.approvedDate || b.createdAt || 0) -
          new Date(a.updatedAt || a.approvedDate || a.createdAt || 0)
        );
        break;
      case 'title_asc':
        list.sort((a, b) => String(a.title).localeCompare(String(b.title)));
        break;
      case 'title_desc':
        list.sort((a, b) => String(b.title).localeCompare(String(a.title)));
        break;
      default: break;
    }
    return list;
  }, [docs, q, status, sortKey]);

  const formatDate = (s) => {
    if (!s) return '-';
    const d = new Date(s);
    if (isNaN(d.getTime())) return '-';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const onView = (row) =>
    window.open(`${API_BASE.replace(/\/+$/, '')}/api/docs/${row._id}/preview`, '_blank', 'noopener');

  const onDownload = (row) =>
    window.open(`${API_BASE.replace(/\/+$/, '')}/api/docs/${row._id}/download`, '_blank', 'noopener');

  const onDelete = async (row) => {
    if (!confirm(`Delete "${row.title}"?`)) return;
    const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/docs/${row._id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
    });
    if (res.ok) setDocs(prev => prev.filter(x => x._id !== row._id));
    else alert('Delete failed');
  };

  return (
    <div className="vs-page">
      <h1 className="vs-title">View Status</h1>

      {/* First-image style toolbar: pill dropdowns with embedded labels */}
      <div className="vs-toolbar vs-toolbar-first">
        <input
          className="vs-search vs-search-first"
          placeholder="Search documents..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {/* Filter by Type style (shows label text inside the control) */}
        <div className="vs-pill-select" data-placeholder="Filter by Type">
          <select
            aria-label="Filter by Status"
            value={status}
            onChange={(e)=>setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Sort by Date style (shows label text inside the control) */}
        <div className="vs-pill-select" data-placeholder="Sort by Date">
          <select
            aria-label="Sort by"
            value={sortKey}
            onChange={(e)=>setSortKey(e.target.value)}
          >
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="vs-card">
        <table className="vs-table">
          <thead>
            <tr>
              <th className="vs-title-cell">DOCUMENT TITLE</th>
              <th className="vs-center">TYPE</th>
              <th className="vs-center">STATUS</th>
              <th className="vs-center">UPDATED DATE</th>
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
                <td className="vs-center">{formatDate(doc.updatedAt || doc.approvedDate || doc.createdAt)}</td>
                <td className="vs-center">
                  <button className="vs-action-btn" onClick={()=>onView(doc)} aria-label="View"><Eye /></button>
                  <button className="vs-action-btn" onClick={()=>onDownload(doc)} aria-label="Download"><Download /></button>
                  <button className="vs-action-btn danger" onClick={()=>onDelete(doc)} aria-label="Delete"><Trash /></button>
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
