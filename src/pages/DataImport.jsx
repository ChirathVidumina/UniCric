import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  ArrowRight, 
  ShieldAlert, 
  FileCheck, 
  Sparkles,
  Info
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function DataImport() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [systemMessage, setSystemMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // Validate and select PDF file
  const handleFileSelection = (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadStatus('error');
      setSystemMessage('Invalid file format. Please select an official .pdf scorecard file.');
      setSelectedFile(null);
      return;
    }

    // Size cap check (e.g. max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setUploadStatus('error');
      setSystemMessage('File size exceeds the 15MB limit.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadStatus('idle');
    setSystemMessage('');
  };

  // Drag & Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  // Trigger input file dialog
  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle PDF Upload API integration
  const handleUpload = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setSystemMessage('Processing Scorecard & extracting match telemetry...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_URL}/api/process-pdf-scorecard`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus('success');
        setSystemMessage(result.message || 'Scorecard uploaded successfully.');
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to process PDF scorecard.' }));
        setUploadStatus('error');
        setSystemMessage(errorData.detail || 'Upload failed. Please verify server connection.');
      }
    } catch (err) {
      console.error("PDF upload error:", err);
      setUploadStatus('error');
      setSystemMessage('Unable to reach the backend service. Verify that the FastAPI server is running.');
    }
  };

  // Clear selected file
  const handleReset = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setSystemMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="data-import-page" style={{ paddingBottom: '5rem' }}>
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            <ShieldAlert size={14} /> OFFICIAL SLUSA SCORECARD INGESTION ENGINE
          </div>
          <h1 className="page-title">PDF Scorecard Telemetry Upload</h1>
          <p className="page-subtitle">
            Upload official PDF scorecards to process match telemetry into the database.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Upload Container Card */}
        <div className="content-card" style={{ padding: '2rem', borderLeft: '4px solid #dc2626' }}>
          
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={22} color="#dc2626" /> Match Scorecard Upload (PDF)
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Select or drag and drop an official CricHeroes PDF scorecard file to ingest match statistics.
          </p>

          {/* Hidden File Input */}
          <input 
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelection(e.target.files[0]);
              }
            }}
          />

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={!selectedFile && uploadStatus !== 'uploading' ? onButtonClick : undefined}
            style={{
              border: dragActive ? '2px dashed #dc2626' : selectedFile ? '2px solid #10b981' : '2px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              background: dragActive ? 'rgba(220, 38, 38, 0.08)' : selectedFile ? 'rgba(16, 185, 129, 0.05)' : '#0f172a',
              cursor: !selectedFile && uploadStatus !== 'uploading' ? 'pointer' : 'default',
              transition: 'all 0.25s ease',
              marginBottom: '1.5rem',
              position: 'relative'
            }}
          >
            {!selectedFile ? (
              <div>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Upload size={28} color="#dc2626" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.35rem', color: 'white' }}>
                  Drag & Drop PDF Scorecard Here
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  or browse files on your device (Only .pdf format supported)
                </p>
                <button
                  type="button"
                  onClick={onButtonClick}
                  style={{
                    padding: '0.65rem 1.35rem',
                    borderRadius: '8px',
                    border: '1px solid #dc2626',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  Select PDF File
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={24} color="#10b981" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', margin: 0 }}>
                      {selectedFile.name}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Size: {formatFileSize(selectedFile.size)} • PDF Document
                    </span>
                  </div>
                </div>

                {uploadStatus !== 'uploading' && (
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Remove file"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}
                  >
                    <X size={16} /> Remove
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons & Status Messages */}
          {selectedFile && uploadStatus !== 'success' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploadStatus === 'uploading'}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: uploadStatus === 'uploading' ? '#475569' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: uploadStatus === 'uploading' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: uploadStatus === 'uploading' ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} /> Processing Scorecard...
                  </>
                ) : (
                  <>
                    Upload & Process Scorecard <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Loading Indicator Details */}
          {uploadStatus === 'uploading' && (
            <div style={{ padding: '1.25rem', background: '#0f172a', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.9rem' }}>
                <RefreshCw className="animate-spin" size={18} /> Processing Scorecard...
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Extracting innings, ball-by-ball telemetry, and bowler performance...
              </p>
            </div>
          )}

          {/* Success Banner */}
          {uploadStatus === 'success' && (
            <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <CheckCircle2 size={22} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#10b981', margin: '0 0 0.25rem 0' }}>
                    Scorecard Upload Successful
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'white', margin: 0 }}>
                    {systemMessage}
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      marginTop: '0.85rem',
                      padding: '0.45rem 0.85rem',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      color: '#10b981',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Upload Another Scorecard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {uploadStatus === 'error' && (
            <div style={{ padding: '1.25rem', background: 'rgba(220, 38, 38, 0.12)', border: '1px solid rgba(220, 38, 38, 0.4)', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <AlertCircle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#ef4444', margin: '0 0 0.25rem 0' }}>
                    Upload Failed
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'white', margin: 0 }}>
                    {systemMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Integration Guidelines Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Info size={16} color="#94a3b8" />
            <span>Files are securely transmitted to backend endpoint: <code style={{ background: '#0f172a', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#94a3b8' }}>/api/process-pdf-scorecard</code></span>
          </div>

        </div>
      </div>
    </div>
  );
}
