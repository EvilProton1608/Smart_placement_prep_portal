import axios from 'axios';
import { useEffect, useState } from 'react';
import '../styles/Analytics.css';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/user/analytics', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setProgress(response.data.progress || null);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnalytics();
    } else {
      setError('You are not logged in.');
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        <h1>User Progress</h1>

        {error && <div className="analytics-error">{error}</div>}

        {/* User Progress */}
        <div className="recent-attempts">
          {progress ? (
            <>
              <div className="category-performance">
                <h2>Accuracy</h2>
                <div className="performance-cards">
                  <div className="performance-card">
                    <h3>Coding</h3>
                    <div className="performance-stats">
                      <div className="stat-item">
                        <span className="label">Accuracy:</span>
                        <span className="value">{Number(progress.codingAccuracy || 0).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill coding"
                        style={{ width: `${Math.max(0, Math.min(100, Number(progress.codingAccuracy || 0)))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="performance-card">
                    <h3>Aptitude</h3>
                    <div className="performance-stats">
                      <div className="stat-item">
                        <span className="label">Accuracy:</span>
                        <span className="value">{Number(progress.aptitudeAccuracy || 0).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill aptitude"
                        style={{ width: `${Math.max(0, Math.min(100, Number(progress.aptitudeAccuracy || 0)))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="attempts-list">
                <div className="attempt-item correct">
                  <div className="attempt-info">
                    <div className="question-title">Weak Topics</div>
                    <div className="attempt-meta">
                      <span className="badge time">
                        {Array.isArray(progress.weakTopics) && progress.weakTopics.length > 0
                          ? progress.weakTopics.join(', ')
                          : 'None yet'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="attempt-item correct">
                  <div className="attempt-info">
                    <div className="question-title">Strong Topics</div>
                    <div className="attempt-meta">
                      <span className="badge time">
                        {Array.isArray(progress.strongTopics) && progress.strongTopics.length > 0
                          ? progress.strongTopics.join(', ')
                          : 'None yet'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-attempts">
              <p>No progress data yet. Attempt a few questions first.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
