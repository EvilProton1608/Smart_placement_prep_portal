import axios from 'axios';
import { useEffect, useState } from 'react';
import '../styles/Analytics.css';

export default function Analytics() {
  const [stats, setStats] = useState({
    totalAttempts: 0,
    correctAnswers: 0,
    accuracy: 0,
    codingAttempts: 0,
    aptitudeAttempts: 0,
    codingAccuracy: 0,
    aptitudeAccuracy: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/user/${userId}/analytics`);
        
        if (response.data.success) {
          setStats(response.data.stats);
          setAttempts(response.data.attempts || []);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again.');
        // Set mock data for demonstration
        setStats({
          totalAttempts: 15,
          correctAnswers: 10,
          accuracy: 66.67,
          codingAttempts: 5,
          aptitudeAttempts: 10,
          codingAccuracy: 80,
          aptitudeAccuracy: 60
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAnalytics();
    }
  }, [userId]);

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        <h1>Your Performance Analytics</h1>

        {error && <div className="analytics-error">{error}</div>}

        {/* Overall Stats */}
        <div className="stats-grid">
          <div className="stat-card overall">
            <h3>Overall Accuracy</h3>
            <div className="stat-value">{stats.accuracy.toFixed(2)}%</div>
            <div className="stat-label">
              {stats.correctAnswers} / {stats.totalAttempts} Correct
            </div>
          </div>

          <div className="stat-card total-attempts">
            <h3>Total Attempts</h3>
            <div className="stat-value">{stats.totalAttempts}</div>
            <div className="stat-label">Questions Attempted</div>
          </div>

          <div className="stat-card correct">
            <h3>Correct Answers</h3>
            <div className="stat-value">{stats.correctAnswers}</div>
            <div className="stat-label">
              {stats.totalAttempts > 0 ? ((stats.correctAnswers / stats.totalAttempts) * 100).toFixed(1) : 0}% success rate
            </div>
          </div>

          <div className="stat-card incorrect">
            <h3>Incorrect Answers</h3>
            <div className="stat-value">{stats.totalAttempts - stats.correctAnswers}</div>
            <div className="stat-label">
              {stats.totalAttempts > 0 ? (((stats.totalAttempts - stats.correctAnswers) / stats.totalAttempts) * 100).toFixed(1) : 0}% fail rate
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="category-performance">
          <h2>Performance by Category</h2>
          <div className="performance-cards">
            <div className="performance-card">
              <h3>Coding Questions</h3>
              <div className="performance-stats">
                <div className="stat-item">
                  <span className="label">Attempts:</span>
                  <span className="value">{stats.codingAttempts}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Accuracy:</span>
                  <span className="value">{stats.codingAccuracy.toFixed(2)}%</span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill coding"
                  style={{ width: `${stats.codingAccuracy}%` }}
                ></div>
              </div>
            </div>

            <div className="performance-card">
              <h3>Aptitude Questions</h3>
              <div className="performance-stats">
                <div className="stat-item">
                  <span className="label">Attempts:</span>
                  <span className="value">{stats.aptitudeAttempts}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Accuracy:</span>
                  <span className="value">{stats.aptitudeAccuracy.toFixed(2)}%</span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill aptitude"
                  style={{ width: `${stats.aptitudeAccuracy}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="recent-attempts">
          <h2>Recent Attempts</h2>
          {attempts.length > 0 ? (
            <div className="attempts-list">
              {attempts.slice(0, 10).map((attempt, idx) => (
                <div key={idx} className={`attempt-item ${attempt.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="attempt-info">
                    <div className="question-title">{attempt.question?.title || 'Question'}</div>
                    <div className="attempt-meta">
                      <span className={`badge ${attempt.isCorrect ? 'success' : 'error'}`}>
                        {attempt.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                      <span className="badge time">
                        {new Date(attempt.attemptedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-attempts">
              <p>No attempts yet. Start solving questions to see your progress!</p>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <h2>Performance Tips</h2>
          <div className="tips-list">
            <div className="tip">
              <span className="tip-icon">💡</span>
              <p>Focus on topics where your accuracy is below 70%</p>
            </div>
            <div className="tip">
              <span className="tip-icon">📈</span>
              <p>Attempt more coding questions to improve your problem-solving skills</p>
            </div>
            <div className="tip">
              <span className="tip-icon">⏱️</span>
              <p>Time management is key - practice against the clock</p>
            </div>
            <div className="tip">
              <span className="tip-icon">🎯</span>
              <p>Review explanations for incorrect answers to learn better</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
