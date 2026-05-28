import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

export default function Sidebar({ isOpen = false, toggle }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/coding', label: 'Coding' },
    { path: '/aptitude', label: 'Aptitude' },
    { path: '/mocktest', label: 'Mock Tests'},
    { path: '/analytics', label: 'Analytics' },
    { path: '/profile', label: 'Profile' },
    { path: '/resume-analyzer', label: 'Resume' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleMenuItemClick = () => {
    // Close sidebar on mobile when a menu item is clicked
    if (window.innerWidth <= 768 && toggle) {
      toggle();
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'} ${collapsed ? 'collapsed' : ''}`}>
      {/* Close Button for Mobile */}
      <button 
        className="sidebar-close-btn"
        onClick={toggle}
        title="Close Sidebar"
      >
        Close
      </button>

      {/* Collapse Button */}
      <button
        className="collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? 'Expand' : 'Collapse'}
      </button>

      {/* Sidebar Header */}
      <div className="sidebar-header">
        <span className="sidebar-title">Menu</span>
      </div>

      {/* Menu Items */}
      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
            title={item.label}
            onClick={handleMenuItemClick}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
            {isActive(item.path) && <span className="active-indicator"></span>}
          </Link>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="footer-tip">
          <span className="tip-icon"></span>
          <span className="tip-text">
            {collapsed ? '': 'Practice daily for better results!'}
          </span>
        </div>
      </div>
    </div>
  );
}
