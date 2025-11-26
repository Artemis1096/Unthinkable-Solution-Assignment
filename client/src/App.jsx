import React, { useState } from 'react';
import UploadArea from './components/UploadArea';
import AnalysisResult from './components/AnalysisResult';
import RecentAnalyses from './components/RecentAnalyses';
import { uploadDocument } from './api/analyzeApi';
import './index.css';

function App() {
  // State management for the analysis process
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [useLLM, setUseLLM] = useState(false);

  // Handler for file upload triggered by UploadArea
  const handleUpload = async (file) => {
    setError(null);
    setIsLoading(true);
    // Clear previous result while loading to ensure clean UI state
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadDocument(formData, useLLM);

      if (response.success) {
        setResult(response.data);
      } else {
        setError('Analysis failed: Server returned success=false');
      }
    } catch (err) {
      console.error('Upload error:', err);
      let msg = 'An unexpected error occurred. Please try again.';

      if (err.response) {
        // Server responded with a status code outside 2xx range
        msg = err.response.data?.message || `Server Error (${err.response.status})`;
      } else if (err.request) {
        // Request was made but no response received
        msg = 'Network Error: Could not reach the server. Please check your connection.';
      } else {
        // Something happened in setting up the request
        msg = err.message;
      }

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Social Media Content Analyzer</h1>
        <p>
          Upload your content (PDF or Image) to automatically extract text and get
          engagement suggestions for your social media posts.
        </p>

        {result && (
          <div className="recent-upload-summary">
            <span className="summary-label">Recent Analysis:</span>
            <span className="summary-filename">{result.fileName}</span>
            <span className="summary-date">({new Date(result.createdAt).toLocaleTimeString()})</span>
          </div>
        )}
      </header>

      <main className="app-main">
        <UploadArea
          onUpload={handleUpload}
          isLoading={isLoading}
          useLLM={useLLM}
          onToggleLLM={setUseLLM}
        />

        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Processing, please wait...</p>
          </div>
        )}

        {error && (
          <div className="error-message" role="alert">
            <div className="error-icon">⚠️</div>
            <div className="error-text">
              <strong>Analysis Failed</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && (
          <AnalysisResult result={result} onReset={handleReset} />
        )}

        <RecentAnalyses />
      </main>
    </div>
  );
}

export default App;
