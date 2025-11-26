import React, { useEffect, useState } from 'react';
import { getRecentAnalyses, clearRecentAnalyses } from '../api/analyzeApi';

const RecentAnalyses = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        fetchRecent();
    }, []);

    const fetchRecent = async () => {
        try {
            setLoading(true);
            const response = await getRecentAnalyses();
            setItems(response.data || []);
            setError(null);
        } catch (err) {
            setError('Failed to load recent analyses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to clear all analyses? This action cannot be undone.'
        );

        if (!confirmed) return;

        try {
            setClearing(true);
            await clearRecentAnalyses();
            setItems([]);
            setError(null);
        } catch (err) {
            setError('Failed to clear analyses');
            console.error(err);
        } finally {
            setClearing(false);
        }
    };

    if (loading) {
        return <div className="recent-loading">Loading recent analyses...</div>;
    }

    if (error) {
        return <div className="recent-error">{error}</div>;
    }

    if (items.length === 0) {
        return (
            <div className="recent-analyses">
                <h3>Recent Analyses</h3>
                <p style={{ color: '#888', fontStyle: 'italic' }}>No analyses yet. Upload a file to get started!</p>
            </div>
        );
    }

    return (
        <div className="recent-analyses">
            <div className="recent-header-section">
                <h3>Recent Analyses</h3>
                <button
                    onClick={handleClearAll}
                    className="clear-all-btn"
                    disabled={clearing}
                >
                    {clearing ? 'Clearing...' : 'Clear All'}
                </button>
            </div>
            <div className="recent-grid">
                {items.map((item) => (
                    <div key={item._id} className="recent-card">
                        <div className="recent-header">
                            <span className="recent-filename" title={item.fileName}>
                                {item.fileName}
                            </span>
                            <span className="recent-badge">{item.fileType}</span>
                        </div>
                        <div className="recent-meta">
                            <span>{item.suggestions?.length || 0} suggestions</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentAnalyses;
