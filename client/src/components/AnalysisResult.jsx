import React from 'react';
import LLMInsights from './LLMInsights';

const AnalysisResult = ({ result, onReset }) => {
    if (!result) return null;

    const { fileName, fileType, text, suggestions, createdAt } = result;

    return (
        <div className="analysis-result">
            <div className="result-header">
                <h2>Analysis Result</h2>
                {onReset && (
                    <button onClick={onReset} className="reset-btn">
                        Analyze Another
                    </button>
                )}
            </div>

            <div className="file-metadata">
                <p>
                    <strong>File:</strong> {fileName}
                    <span className="file-type-badge">{fileType}</span>
                </p>
                <p className="timestamp">
                    {new Date(createdAt).toLocaleString()}
                </p>
            </div>

            <div className="result-grid">
                <div className="card text-card">
                    <h3>Extracted Text</h3>
                    <div className="text-content">
                        {text || <em>No text extracted.</em>}
                    </div>
                </div>

                <div className="card suggestions-card">
                    <h3>Engagement Suggestions</h3>
                    {suggestions && suggestions.length > 0 ? (
                        <ul className="suggestions-list">
                            {suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-suggestions">No suggestions generated.</p>
                    )}

                    {result.llm && (
                        <LLMInsights llm={result.llm} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalysisResult;
