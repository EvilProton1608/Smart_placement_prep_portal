import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data) {
          setProfileData(response.data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
          <div className="profile-name-section">
            <h1 className="profile-name">{profileData?.name || 'User'}</h1>
            <p className="profile-email">{profileData?.email || 'No email'}</p>
          </div>
          <div className="profile-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/edit-profile')}
            >
              ✏️ Edit Profile
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/change-password')}
            >
              🔒 Change Password
            </button>
          </div>
        </div>

        {/* Profile Information Cards */}
        <div className="profile-content">
          {/* Personal Information Card */}
          <div className="profile-card">
            <h2 className="card-title">👤 Personal Information</h2>
            <div className="card-content">
              <div className="info-row">
                <label>Full Name:</label>
                <span>{profileData?.name || 'Not provided'}</span>
              </div>
              <div className="info-row">
                <label>Email:</label>
                <span>{profileData?.email || 'Not provided'}</span>
              </div>
              {profileData?.phone && (
                <div className="info-row">
                  <label>Phone:</label>
                  <span>{profileData.phone}</span>
                </div>
              )}
              {profileData?.bio && (
                <div className="info-row">
                  <label>Bio:</label>
                  <span>{profileData.bio}</span>
                </div>
              )}
            </div>
          </div>

          {/* Education Information Card */}
          <div className="profile-card">
            <h2 className="card-title">🎓 Education Details</h2>
            <div className="card-content">
              <div className="info-row">
                <label>Branch:</label>
                <span>{profileData?.branch || 'Not provided'}</span>
              </div>
              <div className="info-row">
                <label>College:</label>
                <span>{profileData?.college || 'Not provided'}</span>
              </div>
              <div className="info-row">
                <label>Graduation Year:</label>
                <span>{profileData?.graduationYear || 'Not provided'}</span>
              </div>
              {profileData?.cgpa && (
                <div className="info-row">
                  <label>CGPA:</label>
                  <span>{profileData.cgpa}</span>
                </div>
              )}
            </div>
          </div>

          {/* Career Information Card */}
          <div className="profile-card">
            <h2 className="card-title">💼 Career Information</h2>
            <div className="card-content">
              {profileData?.targetCompanies && profileData.targetCompanies.length > 0 ? (
                <div className="info-row">
                  <label>Target Companies:</label>
                  <div className="companies-list">
                    {profileData.targetCompanies.map((company, index) => (
                      <span key={index} className="company-tag">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="info-row">
                  <label>Target Companies:</label>
                  <span>Not provided</span>
                </div>
              )}
              {profileData?.skills && profileData.skills.length > 0 && (
                <div className="info-row">
                  <label>Skills:</label>
                  <div className="skills-list">
                    {profileData.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Information Card */}
          <div className="profile-card">
            <h2 className="card-title">🔐 Account Information</h2>
            <div className="card-content">
              <div className="info-row">
                <label>Account Status:</label>
                <span className="status-active">Active</span>
              </div>
              <div className="info-row">
                <label>Member Since:</label>
                <span>
                  {profileData?.createdAt 
                    ? new Date(profileData.createdAt).toLocaleDateString() 
                    : 'Unknown'}
                </span>
              </div>
              {profileData?.lastLogin && (
                <div className="info-row">
                  <label>Last Login:</label>
                  <span>
                    {new Date(profileData.lastLogin).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons at Bottom */}
        <div className="profile-footer">
          <button 
            className="btn btn-primary-lg"
            onClick={() => navigate('/edit-profile')}
          >
            ✏️ Edit All Details
          </button>
          <button 
            className="btn btn-secondary-lg"
            onClick={() => navigate('/change-password')}
          >
            🔒 Change Password
          </button>
          <button 
            className="btn btn-tertiary"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
