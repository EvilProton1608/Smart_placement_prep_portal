import axios from 'axios';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

      // Validation
      if (!formData.currentPassword.trim()) {
        setError('Current password is required');
        setSubmitting(false);
        return;
      }

      if (!formData.newPassword.trim()) {
        setError('New password is required');
        setSubmitting(false);
        return;
      }

      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        setSubmitting(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        setSubmitting(false);
        return;
      }

      if (formData.currentPassword === formData.newPassword) {
        setError('New password must be different from current password');
        setSubmitting(false);
        return;
      }

      await axios.post(
        'http://localhost:5000/api/user/change-password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSuccess('Password changed successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="page-header">
          <h1>Change Password</h1>
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate('/profile')}
          >
            Back
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form className="edit-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <h3>Password Security</h3>
            <p className="section-description">
              For your security, we need your current password to create a new one.
            </p>

            <div className="form-group">
              <label htmlFor="currentPassword">Current Password *</label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your current password"
                required
                autoComplete="current-password"
              />
            </div>
          </section>

          <section className="form-section">
            <h3>New Password</h3>

            <div className="form-group">
              <label htmlFor="newPassword">New Password *</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter a new password"
                required
                minLength="6"
                autoComplete="new-password"
              />
              <small className="form-hint">
                Minimum 6 characters. Use a strong mix of uppercase, lowercase, numbers, and symbols.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password *</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Re-enter your new password"
                required
                minLength="6"
                autoComplete="new-password"
              />
              <small className="form-hint">
                Both passwords must match
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
              {submitting ? 'Updating...' : 'Change Password'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/profile')}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
