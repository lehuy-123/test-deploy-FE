import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/SidebarAdmin.css';
import { FaBars, FaTimes } from 'react-icons/fa';

const SidebarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menu = [
    { path: '/admin', label: '📊 Dashboard' },
    { path: '/admin/users', label: '👥 Người dùng' },
    { path: '/admin/posts', label: '📝 Bài viết' },
    { path: '/admin/comments', label: '🗨️ Bình luận' },
    { path: '/admin/tags', label: '🏷️ Quản lý Tag' },
    { path: '/', label: '⬅️ Quay lại Blog' },
  ];

  useEffect(() => {
    // Ngăn scroll trên body khi menu mở
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // Xử lý touch events
  const handleTouchStart = (e) => {
    if (isOpen) {
      e.preventDefault();
    }
  };

  return (
    <>
      <button 
        className="hamburger-btn" 
        onClick={toggleMenu}
        aria-label="Toggle menu"
        role="button"
        tabIndex={0}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      
      <div 
        className={`sidebar-admin ${isOpen ? 'open' : ''}`}
        onTouchStart={handleTouchStart}
      >
        <h2 className="logo">🔧 Admin</h2>
        <ul>
          {menu.map((item) => (
            <li
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={location.pathname === item.path ? 'active' : ''}
              role="button"
              tabIndex={0}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
      
      {isOpen && (
        <div 
          className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
          onClick={toggleMenu}
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
        />
      )}
    </>
  );
};

export default SidebarAdmin;
