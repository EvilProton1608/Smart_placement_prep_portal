import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    college: '',
    graduationYear: new Date().getFullYear(),
    targetCompanies: ''
  });

  // Fetch current profile data on mount
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
          setFormData({
            name: response.data.name || '',
            branch: response.data.branch || '',
            college: response.data.college || '',
            graduationYear: response.data.graduationYear || new Date().getFullYear(),
            targetCompanies: response.data.targetCompanies?.join(', ') || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      setSubmitting(true);

      // Validate inputs
      if (!formData.name.trim()) {
        setError('Full name is required');
        setSubmitting(false);
        return;
      }

      const updateData = {
        name: formData.name.trim(),
        branch: formData.branch.trim(),
        college: formData.college.trim(),
        graduationYear: parseInt(formData.graduationYear),
        targetCompanies: formData.targetCompanies
          .split(',')
          .map(c => c.trim())
          .filter(c => c)
      };

      await axios.put(
        'http://localhost:5000/api/user/profile',
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSuccess('✅ Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="page-header">
          <h1>✏️ Edit Profile</h1>
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate('/profile')}
          >
            ← Back
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form className="edit-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <h3>Personal Information</h3>

            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>
          </section>

          <section className="form-section">
            <h3>Education Details</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="branch">Branch/Program</label>
                <input
                  id="branch"
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="form-group">
                <label htmlFor="college">College/University</label>
                <input
                  id="college"
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., IIT Delhi"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="graduationYear">Graduation Year</label>
              <select
                id="graduationYear"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleInputChange}
                className="form-input"
              >
                {[...Array(10)].map((_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </section>

          <section className="form-section">
            <h3>Career Preferences</h3>

            <div className="form-group">
              <label htmlFor="targetCompanies">Target Companies (Comma-separated)</label>
              <textarea
                id="targetCompanies"
                name="targetCompanies"
                value={formData.targetCompanies}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., Google, Microsoft, Amazon"
                rows="4"
              />
              <small className="form-hint">
                Enter company names separated by commas
              </small>
            </div>
          </section>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? '💾 Saving...' : '💾 Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/profile')}
              disabled={submitting}
            >
              ✕ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
