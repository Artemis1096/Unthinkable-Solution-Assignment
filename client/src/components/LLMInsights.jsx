import React from 'react';

const LLMInsights = ({ llm }) => {
    if (!llm) return null;

    const { sentiment, clarityScore, improvedCaption } = llm;

    return (
        <div className="ai-card">
            <h3>AI Enhanced Analysis (Gemini)</h3>

            <div className="ai-metrics">
                {sentiment && (
                    <div className="metric">
                        <span className="metric-label">Sentiment:</span>
                        <span className={`sentiment-badge ${sentiment.toLowerCase()}`}>
                            {sentiment}
                        </span>
                    </div>
                )}

                {clarityScore !== undefined && (
                    <div className="metric">
                        <span className="metric-label">Clarity Score:</span>
                        <span className="clarity-score">
                            <strong>{clarityScore}</strong>/10
                        </span>
                    </div>
                )}
            </div>

            {improvedCaption && (
                <div className="improved-caption-container">
                    <h4>Improved Caption Idea:</h4>
                    <div className="improved-caption">
                        <p>{improvedCaption}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LLMInsights;
