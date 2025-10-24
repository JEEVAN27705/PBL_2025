import React, { useMemo, useState } from 'react';
import './pending-approvals.css';

const rows = [
  { title: 'Mid-term Exam Schedule', type: 'Exam', date: '2023-10-22', submitter: 'Admin A' },
  { title: 'Holiday List 2023', type: 'Holiday', date: '2023-10-20', submitter: 'Admin B' },
  { title: 'Circular on New Uniform', type: 'Circular', date: '2023-10-15', submitter: 'Admin C' },
];

export default function PendingApprovals() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortKey, setSortKey] = useState('Title'); // Title / Type / Submitted By

  const data = useMemo(() => {
    let list = rows.slice();
    const q = query.trim().toLowerCase();

    if (q) {
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.submitter.toLowerCase().includes(q)
      );
    }

    if (typeFilter) {
      list = list.filter(r => r.type.toLowerCase() === typeFilter.toLowerCase());
    }

    if (sortKey === 'Title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortKey === 'Type') {
      list.sort((a, b) => a.type.localeCompare(b.type));
    } else if (sortKey === 'Submitted By') {
      list.sort((a, b) => a.submitter.localeCompare(b.submitter));
    }

    return list;
  }, [query, typeFilter, sortKey]);

  const handleView = (r) => console.log('View', r.title);
  const handleApprove = (r) => console.log('Approve', r.title);
  const handleReject = (r) => console.log('Reject', r.title);

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
        </select>
      </div>

      <div className="pa-table-wrap">
        <table className="pa-table">
          <thead>
            <tr>
              <th>TITLE</th>
              <th>TYPE</th>
              <th>SUBMITTED BY</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={`${r.title}-${r.submitter}`}>
                <td className="pa-title-cell">{r.title}</td>
                <td className="pa-center">{r.type}</td>
                <td className="pa-center">{r.submitter}</td>
                <td className="pa-actions">
                  <button className="btn-view-pill" onClick={() => handleView(r)}>View</button>
                  <button className="btn-approve-pill" onClick={() => handleApprove(r)}>Approve</button>
                  <button className="btn-reject-pill" onClick={() => handleReject(r)}>Reject</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
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
