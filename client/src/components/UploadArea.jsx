import React, { useState } from 'react';

const UploadArea = ({ onUpload, isLoading, useLLM, onToggleLLM }) => {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isLoading) return;

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
        if (isLoading) return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (isLoading) return;

        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    const handleClick = () => {
        if (!isLoading) {
            document.getElementById('file-upload').click();
        }
    };

    return (
        <div
            className={`upload-area ${dragActive ? 'active' : ''} ${isLoading ? 'disabled' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
            style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
        >
            <input
                type="file"
                id="file-upload"
                accept=".pdf, .png, .jpg, .jpeg"
                onChange={handleChange}
                style={{ display: 'none' }}
                disabled={isLoading}
            />

            {isLoading && (
                <div className="upload-overlay">
                    <div className="spinner-small"></div>
                </div>
            )}

            <div className={`upload-content ${isLoading ? 'blurred' : ''}`}>
                <div className="upload-icon">
                    {isLoading ? '⏳' : '📁'}
                </div>
                <p className="upload-text">
                    {isLoading ? 'Processing, please wait...' : (
                        <>Drag & drop a PDF or image here, or <span className="highlight">click to browse</span></>
                    )}
                </p>
                {!isLoading && <p className="upload-hint">Supports PDF, PNG, JPG, JPEG</p>}

                {!isLoading && (
                    <div className="upload-options" onClick={(e) => e.stopPropagation()}>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={useLLM}
                                onChange={(e) => onToggleLLM(e.target.checked)}
                            />
                            Enable LLM (Gemini) analysis
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadArea;
