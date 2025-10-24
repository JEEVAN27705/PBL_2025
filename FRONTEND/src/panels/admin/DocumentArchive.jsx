import React, { useMemo, useState } from 'react';
import { FiEye, FiDownload, FiTrash2 } from 'react-icons/fi';
import './document-archive.css';

const documents = [
  { title: 'Mid-term Exam Schedule', type: 'Exam',  date: '2023-10-22' },
  { title: 'Holiday List 2023', type: 'Holidays',  date: '2023-10-20' },
  { title: 'Circular on New Uniform', type: 'Circular', date: '2023-10-15' },
];

export default function DocumentArchive() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortKey, setSortKey] = useState('');

  const handleView = (doc) => { console.log('View:', doc.title); };
  const handleDownload = (doc) => { console.log('Download:', doc.title); };
  const handleRemove = (doc) => { console.log('Remove:', doc.title); };

  // Safe date parser for ISO-like strings (YYYY-MM-DD)
  const toDate = (s) => new Date(s);

  // Apply search, filter, then sort
  const filteredDocs = useMemo(() => {
    let list = documents.slice();

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.date.toLowerCase().includes(q)
      );
    }

    if (typeFilter) {
      list = list.filter(d => d.type.toLowerCase() === typeFilter.toLowerCase());
    }

    if (sortKey === 'Newest') {
      list.sort((a, b) => toDate(b.date) - toDate(a.date));
    } else if (sortKey === 'Oldest') {
      list.sort((a, b) => toDate(a.date) - toDate(b.date));
    } 

    return list;
  }, [query, typeFilter, sortKey]);

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
            <option value="">Filter by Type</option>
            <option value="Exam">Exam</option>
            <option value="Holidays">Holidays</option>
            <option value="Circular">Circular</option>
          </select>

          <select
            className="doc-sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            aria-label="Sort documents"
          >
            <option value="">Sort by Date</option>
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>
        </div>

        <table className="doc-archive-table">
          <thead>
            <tr>
              <th>DOCUMENT TITLE</th>
              <th>TYPE</th>
              <th>APPROVED DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc) => (
              <tr key={doc.title}>
                <td className="doc-title-cell">{doc.title}</td>
                <td className="doc-center">{doc.type}</td>
                <td className="doc-center">{doc.date}</td>
                <td className="doc-center">
                  <button className="doc-action-btn" title="View" onClick={() => handleView(doc)}>
                    <FiEye />
                  </button>
                  <button className="doc-action-btn" title="Download" onClick={() => handleDownload(doc)}>
                    <FiDownload />
                  </button>
                  <button className="doc-action-btn danger" title="Remove" onClick={() => handleRemove(doc)}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
            {filteredDocs.length === 0 && (
              <tr>
                <td colSpan={4} className="doc-center" style={{ padding: 24, color: '#9fb0c9' }}>
                  No documents match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
