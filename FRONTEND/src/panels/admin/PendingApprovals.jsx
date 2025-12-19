import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './pending-approvals.css';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || 'http://localhost:5000';

export default function PendingApprovals() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState(''); // Maybe less useful if API already filters, but good for further filtering
  const [sortKey, setSortKey] = useState('Title');
  const navigate = useNavigate();

  // Fetch pending approvals
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken') || '';
        const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/admin/pending-approvals`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load pending approvals');
        const data = await res.json();
        setDocs(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpdateStatus = async (doc, status) => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/docs/${doc._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Remove from list
        setDocs(docs.filter(d => d._id !== doc._id));
      } else {
        alert(`${status} failed`);
      }
    } catch (e) {
      alert(`${status} failed`);
    }
  };

  const handleView = (doc) => {
    navigate(`/admin/docs/${doc._id}/preview`, { state: { title: doc.title } });
  };
  const handleApprove = (doc) => handleUpdateStatus(doc, 'verified');
  const handleReject = (doc) => handleUpdateStatus(doc, 'rejected');

  const filteredDocs = useMemo(() => {
    let list = docs.slice();
    const q = query.trim().toLowerCase();

    if (q) {
      list = list.filter(d =>
        (d.title || '').toLowerCase().includes(q) ||
        (d.type || '').toLowerCase().includes(q) ||
        (d.verifyDept || '').toLowerCase().includes(q)
      );
    }
    if (typeFilter) {
      list = list.filter(d => (d.type || '').toLowerCase() === typeFilter.toLowerCase());
    }
    if (deptFilter) {
      list = list.filter(d => (d.verifyDept || '').toLowerCase() === deptFilter.toLowerCase());
    }

    if (sortKey === 'Title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortKey === 'Type') {
      list.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
    } else if (sortKey === 'Department') {
      list.sort((a, b) => (a.verifyDept || '').localeCompare(b.verifyDept || ''));
    }

    return list;
  }, [docs, query, typeFilter, deptFilter, sortKey]);

  return (
    <div className="pa-page">
      <div className="pa-header">
        <h2 className="pa-title">Pending Approvals</h2>
        <p className="pa-subtitle">Review and manage documents awaiting approval.</p>
      </div>

      <div className="pa-toolbar">
        <input
          className="pa-search"
          placeholder="Search documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search pending documents"
        />

        <select
          className="pa-filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter by type"
        >
          <option value="">Filter By Type</option>
          <option value="Exam">Exam</option>
          <option value="Holiday">Holiday</option>
          <option value="Circular">Circular</option>
          <option value="pdf">PDF</option>
        </select>

        <select
          className="pa-filter"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          aria-label="Filter by department"
        >
          <option value="">Filter By Department</option>
          <option value="Accounts">Accounts</option>
          <option value="HR">HR</option>
          <option value="Legal">Legal</option>
        </select>
      </div>

      <div className="pa-table-wrap">
        <table className="pa-table">
          <thead>
            <tr>
              <th>TITLE</th>
              <th>TYPE</th>
              <th>DEPARTMENT</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="pa-center">Loading...</td></tr>}
            {!loading && filteredDocs.map((r) => (
              <tr key={r._id}>
                <td className="pa-title-cell">{r.title}</td>
                <td className="pa-center">{r.type || 'pdf'}</td>
                <td className="pa-center">{r.verifyDept}</td>
                <td className="pa-actions">
                  <button className="btn-view-pill" onClick={() => handleView(r)}>View</button>
                  <button className="btn-approve-pill" onClick={() => handleApprove(r)}>Approve</button>
                  <button className="btn-reject-pill" onClick={() => handleReject(r)}>Reject</button>
                </td>
              </tr>
            ))}
            {!loading && filteredDocs.length === 0 && (
              <tr>
                <td colSpan={4} className="pa-center pa-empty">No pending items.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
