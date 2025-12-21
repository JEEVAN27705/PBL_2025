import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiDownload, FiTrash2 } from 'react-icons/fi';
import './document-archive.css';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || 'http://localhost:5000';

export default function DocumentArchive() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortKey, setSortKey] = useState('');
  const navigate = useNavigate();

  // Fetch my uploads
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken') || '';
        const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/admin/view-status?mine=true`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load documents');
        const data = await res.json();
        setDocs(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleView = (doc) => {
    navigate(`/admin/docs/${doc._id}/preview`, { state: { title: doc.title } });
  };

  const handleDownload = async (doc) => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/docs/${doc._id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title || 'document.pdf'; // Simplified since backend handles Content-Disposition usually, but this is a fallback.
      // Better to check header but this is acceptable for now.
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Download failed');
    }
  };

  const handleRemove = async (doc) => {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/upload/${doc._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDocs(docs.filter(d => d._id !== doc._id));
      } else {
        alert('Delete failed');
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  // Safe date parser
  const toDate = (s) => new Date(s || 0);

  // Apply search, filter, then sort
  const filteredDocs = useMemo(() => {
    let list = docs.slice();
    const q = query.trim().toLowerCase();

    if (q) {
      list = list.filter(d =>
        (d.title || '').toLowerCase().includes(q) ||
        (d.type || '').toLowerCase().includes(q)
      );
    }

    if (typeFilter) {
      list = list.filter(d => (d.type || '').toLowerCase() === typeFilter.toLowerCase());
    }

    if (sortKey) {
      list.sort((a, b) => {
        const da = toDate(a.createdAt);
        const db = toDate(b.createdAt);
        return sortKey === 'Newest' ? db - da : da - db;
      });
    }

    return list;
  }, [docs, query, typeFilter, sortKey]);

  // Format date YYYY-MM-DD
  const formatDate = (d) => {
    if (!d) return '-';
    // Use createdAt or uploadedAt from doc
    return new Date(d).toISOString().split('T')[0];
  };

  return (
    <div className="doc-archive-page">
      <h2 className="doc-archive-title">Document Archive</h2>

      <div className="doc-archive-card">
        <div className="doc-archive-toolbar">
          <input
            className="doc-search"
            placeholder="Search documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search documents"
          />

          <select
            className="doc-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by document type"
          >
            <option value="">Filter By Type</option>
            <option value="Exam">Exam</option>
            <option value="Holidays">Holidays</option>
            <option value="Circular">Circular</option>
            <option value="pdf">PDF</option>
          </select>

          <select
            className="doc-sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            aria-label="Sort documents"
          >
            <option value="">Sort By Date</option>
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>
        </div>

        <table className="doc-archive-table">
          <thead>
            <tr>
              <th>DOCUMENT TITLE</th>
              <th>TYPE</th>
              <th>UPLOADED DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="doc-center">Loading...</td></tr>}
            {!loading && filteredDocs.map((doc) => (
              <tr key={doc._id}>
                <td className="doc-title-cell">{doc.title}</td>
                <td className="doc-center">{doc.type || 'pdf'}</td>
                <td className="doc-center">{formatDate(doc.createdAt)}</td>
                <td className="doc-center">
                  <div className="doc-actions-wrapper">
                    <button className="doc-action-btn" title="View" onClick={() => handleView(doc)}>
                      <FiEye />
                    </button>
                    <button className="doc-action-btn" title="Download" onClick={() => handleDownload(doc)}>
                      <FiDownload />
                    </button>
                    <button className="doc-action-btn danger" title="Remove" onClick={() => handleRemove(doc)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredDocs.length === 0 && (
              <tr>
                <td colSpan={4} className="doc-center" style={{ padding: 24, color: '#9fb0c9' }}>
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
