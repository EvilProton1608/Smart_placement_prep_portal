import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/Navbar.css';

export default function Navbar({ onMenuClick, sidebarOpen }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Sidebar Toggle Button */}
        <button 
          className="sidebar-toggle-btn"
          onClick={onMenuClick}
          title="Toggle Sidebar"
          aria-label="Toggle Menu"
        >
          <span className={sidebarOpen ? 'bar active' : 'bar'}></span>
          <span className={sidebarOpen ? 'bar active' : 'bar'}></span>
          <span className={sidebarOpen ? 'bar active' : 'bar'}></span>
        </button>

        {/* Logo */}
        <div className="navbar-logo">
          <span className="logo-icon">🎯</span>
          <a href="/dashboard" className="logo-text">
            SmartPlace
          </a>
        </div>

        {/* Hamburger Menu */}
        <div className="hamburger" onClick={toggleMobileMenu}>
          <span className={mobileMenuOpen ? 'bar active' : 'bar'}></span>
          <span className={mobileMenuOpen ? 'bar active' : 'bar'}></span>
          <span className={mobileMenuOpen ? 'bar active' : 'bar'}></span>
        </div>

        {/* Navigation Links */}
        <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <a href="/dashboard" className="nav-link">
              📊 Dashboard
            </a>
          </li>
          <li className="nav-item">
            <a href="/coding" className="nav-link">
              💻 Coding
            </a>
          </li>
          <li className="nav-item">
            <a href="/aptitude" className="nav-link">
              📝 Aptitude
            </a>
          </li>
          <li className="nav-item">
            <a href="/analytics" className="nav-link">
              📈 Analytics
            </a>
          </li>
          <li className="nav-item">
            <a href="/mocktest" className="nav-link">
              🎯 Mock Tests
            </a>
          </li>
        </ul>

        {/* Right side - User Profile & Logout */}
        <div className="navbar-right">
          <div className="user-section">
            <button
              className="user-profile-btn"
              onClick={toggleDropdown}
              title="User Menu"
            >
              <span className="user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
              <span className="user-name">{user?.name || 'User'}</span>
              <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>
                ▼
              </span>
            </button>

            {/* Dropdown Menu */}
            <div className={`dropdown-menu ${dropdownOpen ? 'active' : ''}`}>
              <a href="/profile" className="dropdown-item">
                👤 My Profile
              </a>
              <a href="/edit-profile" className="dropdown-item">
                ✏️ Edit Profile
              </a>
              <a href="/change-password" className="dropdown-item">
                🔒 Change Password
              </a>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item logout-btn">
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
