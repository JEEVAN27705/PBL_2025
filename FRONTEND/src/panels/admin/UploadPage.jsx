import React from 'react';
import './upload-tune.css';

export default function UploadPage() {
  return (
    <div className="card">
      <h2 className="title">Upload Document</h2>

      <div className="form-grid">
        <label>Document Title
          <input placeholder="Enter document title" />
        </label>

        <label>Document Type
          <select defaultValue="">
            <option value="" disabled>Select document type</option>
            <option>PDF</option>
            <option>Word</option>
            <option>Image</option>
          </select>
        </label>

        <label>Verify By
          <select defaultValue="">
            <option value="" disabled>Select department</option>
            <option>Accounts</option>
            <option>HR</option>
            <option>Legal</option>
          </select>
        </label>

        <label>Upload Document
          <div className="dropzone">
            Drop files to Attach, or <span className="link">browse</span>
          </div>
        </label>
      </div>

      <div className="actions">
        <button className="btn ghost">Reset</button>
        <button className="btn primary">Submit</button>
      </div>
    </div>
  );
}
