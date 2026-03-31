import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalProblems: 0,
    totalAttempts: 0,
    currentStreak: 0,
    accuracy: 0,
    testsCompleted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const userRes = await axios.get('http://localhost:5000/api/user/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setUserData(userRes.data);

      // Fetch user stats (you may need to create this endpoint)
      try {
        const statsRes = await axios.get('http://localhost:5000/api/user/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setStats(statsRes.data);
      } catch (err) {
        // If stats endpoint doesn't exist, use default stats
        console.log('Stats endpoint not available');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      id: 1,
      title: 'Coding Practice',
      icon: '💻',
      description: 'Solve coding problems and improve your programming skills',
      path: '/coding',
      color: '#667eea'
    },
    {
      id: 2,
      title: 'Aptitude Tests',
      icon: '📊',
      description: 'Practice aptitude questions for campus placements',
      path: '/aptitude',
      color: '#764ba2'
    },
    {
      id: 3,
      title: 'Mock Tests',
      icon: '🎯',
      description: 'Take full-length mock tests to assess your readiness',
      path: '/mocktest',
      color: '#f093fb'
    },
    {
      id: 4,
      title: 'Quiz Mode',
      icon: '❓',
      description: 'Quick quizzes to test your knowledge on various topics',
      path: '/',
      color: '#f5576c'
    }
  ];

  const tips = [
    'Consistency is key! Practice at least 30 minutes daily for better results.',
    'Focus on weak areas and keep practicing until you master them.',
    'Take mock tests regularly to track your progress and improvement.',
    'Analyze your mistakes and learn from them to avoid repeating them.',
    'Maintain a balance between speed and accuracy in problem solving.'
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-greeting">
            <h1>Welcome Back, {userData?.name?.split(' ')[0]}! 👋</h1>
            <p>Ready to ace your placements? Let's get started!</p>
          </div>
          <div className="welcome-avatar">
            <div className="avatar-circle">
              {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-section">
          <h2>Your Progress</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <p className="stat-label">Problems Solved</p>
                <p className="stat-value">{stats.totalProblems}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <p className="stat-label">Accuracy</p>
                <p className="stat-value">{stats.accuracy}%</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <p className="stat-label">Current Streak</p>
                <p className="stat-value">{stats.currentStreak} days</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <p className="stat-label">Tests Completed</p>
                <p className="stat-value">{stats.testsCompleted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Modules */}
        <div className="modules-section">
          <h2>Choose Your Path</h2>
          <div className="modules-grid">
            {modules.map((module) => (
              <div
                key={module.id}
                className="module-card"
                onClick={() => navigate(module.path)}
                style={{ borderTop: `4px solid ${module.color}` }}
              >
                <div className="module-icon">{module.icon}</div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <button className="module-btn">Start Now →</button>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Tip */}
        <div className="tips-section">
          <div className="tip-card">
            <div className="tip-icon">💡</div>
            <div className="tip-content">
              <h3>Daily Tip for Success</h3>
              <p>{randomTip}</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="quick-links-section">
          <h2>Quick Links</h2>
          <div className="quick-links">
            <button 
              className="quick-link-btn"
              onClick={() => navigate('/profile')}
            >
              👤 My Profile
            </button>
            <button 
              className="quick-link-btn"
              onClick={() => navigate('/analytics')}
            >
              📈 My Analytics
            </button>
            <button 
              className="quick-link-btn"
              onClick={() => navigate('/edit-profile')}
            >
              ✏️ Edit Profile
            </button>
            <button 
              className="quick-link-btn"
              onClick={() => navigate('/change-password')}
            >
              🔒 Change Password
            </button>
          </div>
        </div>
      </div>
    );
  }
