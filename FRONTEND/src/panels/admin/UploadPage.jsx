import React, { useRef, useState, useCallback, useEffect } from 'react';
import './upload-tune.css';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  'http://localhost:5000';

const HIDDEN_DEFAULT_FLAG = Symbol('hiddenDefault');

function makeMinimalPdfBlob() {
  const pdfBytes = new Uint8Array([
    0x25,0x50,0x44,0x46,0x2D,0x31,0x2E,0x34,0x0A,
    0x25,0xE2,0xE3,0xCF,0xD3,0x0A,
    0x0A,0x0A,0x0A,
  ]);
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export default function UploadPage() {
  const fileInputRef = useRef(null);
  const dropzoneRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('pdf');
  const [verifyDept, setVerifyDept] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const MAX_SIZE_MB = 20;

  // Load user cached by Login
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) setCurrentUser(JSON.parse(userStr));
    } catch {}
  }, []);

  // Optionally refresh user from /api/me (keeps local user fresh)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const url = `${API_BASE.replace(/\/+$/, '')}/api/me`;
        const token = localStorage.getItem('accessToken') || '';
        const res = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const me = await res.json();
          setCurrentUser(me);
          try { localStorage.setItem('user', JSON.stringify(me)); } catch {}
        }
      } catch {}
    };
    fetchMe();
  }, []);

  useEffect(() => {
    setSelectedFiles(prev => {
      if (prev.length === 0) {
        const blob = makeMinimalPdfBlob();
        const def = new File([blob], 'default.pdf', {
          type: 'application/pdf',
          lastModified: Date.now(),
        });
        def[HIDDEN_DEFAULT_FLAG] = true;
        return [def];
      }
      return prev;
    });
  }, []);

  const isPdfFile = (file) =>
    file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

  const validateFiles = (files) => {
    const msgs = [];
    const valid = [];
    for (const f of files) {
      if (!isPdfFile(f)) { msgs.push(`Not a PDF: ${f.name}`); continue; }
      const sizeMB = f.size / (1024 * 1024);
      if (sizeMB > MAX_SIZE_MB) { msgs.push(`Too large: ${f.name} (${sizeMB.toFixed(2)} MB, max ${MAX_SIZE_MB} MB)`); continue; }
      valid.push(f);
    }
    return { valid, msgs };
  };

  const handleBrowseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const mergeFiles = (incoming) => {
    const map = new Map(selectedFiles.map(f => [f.name + '|' + f.size, f]));
    for (const f of incoming) {
      const key = f.name + '|' + f.size;
      if (!map.has(key)) map.set(key, f);
    }
    setSelectedFiles(Array.from(map.values()));
  };

  const handleFileChange = (e) => {
    const input = e.target;
    const filesArr = Array.from(input.files || []);
    if (filesArr.length === 0) return;

    const { valid, msgs } = validateFiles(filesArr);
    setErrors(msgs);
    if (valid.length) mergeFiles(valid);

    input.value = '';
  };

  const onDragEnter = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragOver  = (e) => { e.preventDefault(); };
  const onDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
  };
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const filesArr = Array.from(e.dataTransfer.files || []);
    if (!filesArr.length) return;
    const { valid, msgs } = validateFiles(filesArr);
    setErrors(msgs);
    if (valid.length) mergeFiles(valid);
    dropzoneRef.current?.blur();
  }, [selectedFiles]);

  const visibleFiles = selectedFiles.filter(f => !f[HIDDEN_DEFAULT_FLAG]);

  const removeFile = (fileToRemove) => {
    setSelectedFiles(prev => prev.filter(x => x !== fileToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) { alert('Please enter a document title'); return; }
    if (!verifyDept) { alert('Please select a department to verify'); return; }
    if (visibleFiles.length === 0) { alert('Please select at least one PDF to upload'); return; }

    const token = localStorage.getItem('accessToken') || '';
    if (!token) { alert('Not authenticated. Please log in again.'); return; }

    const url = `${API_BASE.replace(/\/+$/, '')}/api/upload`;
    const formData = new FormData();

    for (const f of visibleFiles) formData.append('files', f);
    formData.append('title', title.trim());
    formData.append('type', docType || 'pdf');
    formData.append('verifyDept', verifyDept);

    // IMPORTANT: Add the fields your backend requires
    const u = currentUser || {};
    const uploadedBy = u.email || u.username || '';
    const userId = u._id || u.id || '';
    const userRole = u.role || 'user';
    formData.append('uploadedBy', uploadedBy);
    formData.append('userId', userId);
    formData.append('userRole', userRole);

    try {
      setUploading(true);
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch {}

      if (!res.ok) throw new Error(data?.message || text || `Upload failed (${res.status})`);

      alert('Files uploaded successfully!');
      setSelectedFiles(() => {
        const blob = makeMinimalPdfBlob();
        const def = new File([blob], 'default.pdf', { type: 'application/pdf', lastModified: Date.now() });
        def[HIDDEN_DEFAULT_FLAG] = true;
        return [def];
      });
      setErrors([]);
      setTitle('');
      setDocType('pdf');
      setVerifyDept('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      alert('Upload failed: ' + (err?.message || err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="title">Upload Documents</h2>

      <div className="form-grid">
        <label>
          Document Title
          <input
            placeholder="Enter document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label>
          Document Type
          <select value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="pdf">PDF</option>
          </select>
        </label>

        <label>
          Verify By
          <select value={verifyDept} onChange={(e) => setVerifyDept(e.target.value)}>
            <option value="" disabled>Select department</option>
            <option value="Accounts">Accounts</option>
            <option value="HR">HR</option>
            <option value="Legal">Legal</option>
          </select>
        </label>

        <label>
          Upload Documents
          <div
            ref={dropzoneRef}
            className={`dropzone ${isDragging ? 'dragging' : ''}`}
            onClick={handleBrowseClick}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            role="button"
            aria-label="Select or drop PDFs to upload"
            tabIndex={0}
          >
            {visibleFiles.length
              ? `${visibleFiles.length} file(s) ready`
              : (isDragging ? 'Drop files here' : 'Drag PDFs to attach, or ')}
            {visibleFiles.length === 0 && !isDragging && <span className="link">Browse</span>}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            multiple
          />

          <div className="hint">
            Only PDF files up to {MAX_SIZE_MB} MB each are allowed. Files are not uploaded until you click Submit.
          </div>

          {visibleFiles.length > 0 && (
            <ul className="file-list">
              {visibleFiles.map((f) => (
                <li key={f.name + '|' + f.size} className="file-row">
                  <span className="file-name">{f.name}</span>
                  <button
                    type="button"
                    className="file-remove"
                    onClick={() => removeFile(f)}
                    aria-label={`Remove ${f.name}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {errors.length > 0 && (
            <div className="errors">
              {errors.map((m, i) => <div key={i} className="error-item">{m}</div>)}
            </div>
          )}
        </label>
      </div>

      <div className="actions">
        <button
          className="btn ghost"
          type="button"
          onClick={() => {
            const blob = makeMinimalPdfBlob();
            const def = new File([blob], 'default.pdf', { type: 'application/pdf', lastModified: Date.now() });
            def[HIDDEN_DEFAULT_FLAG] = true;
            setSelectedFiles([def]);
            setErrors([]);
            setTitle('');
            setDocType('pdf');
            setVerifyDept('');
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          disabled={uploading}
        >
          Reset
        </button>
        <button
          className="btn primary"
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
