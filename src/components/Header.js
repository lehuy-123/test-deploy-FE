import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Header.css';
import { FaHome, FaPen, FaUser, FaSignOutAlt, FaBookmark, FaClipboardList, FaBars } from 'react-icons/fa';
import { MdArticle } from 'react-icons/md';
import api from '../api/api';

const SIDEBAR_WIDTH = 240;

// Di chuyển state ra ngoài component để giữ giá trị khi re-render
let globalIsMobile = window.innerWidth <= 900;

const Header = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(globalIsMobile);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Lỗi khi fetch user:', err);
    }
  };

  useEffect(() => {
    fetchUser();
    const handleUserUpdate = () => fetchUser();
    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      globalIsMobile = mobile;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };

    // Thêm event listener cho resize
    window.addEventListener('resize', handleResize);
    
    // Cập nhật state khi location thay đổi
    setIsMobile(globalIsMobile);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [location]); // Thêm location vào dependencies để cập nhật khi route thay đổi

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <>
      {/* Hamburger icon chỉ hiện trên mobile */}
      {isMobile && (
        <div className="mobile-hamburger" onClick={() => setSidebarOpen(true)}>
          <FaBars />
        </div>
      )}

      {/* Sidebar – luôn hiện trên desktop, trượt ra trên mobile */}
      <nav
        className={`sidebar${sidebarOpen && isMobile ? ' open' : ''}`}
        style={
          !isMobile
            ? { left: 0, width: SIDEBAR_WIDTH, position: 'fixed' }
            : { width: SIDEBAR_WIDTH }
        }
      >
        {isMobile && sidebarOpen && (
          <div className="sidebar-close-btn" style={{ textAlign: 'right', padding: '8px 16px 0 0' }}>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '2rem',
                color: '#d24174',
                cursor: 'pointer'
              }}
              aria-label="Đóng menu"
            >
              &times;
            </button>
          </div>
        )}
        <div className="sidebar-logo">
          <NavLink to="/" onClick={() => isMobile && setSidebarOpen(false)}>
            <img src="/images/new logo.png" alt="Logo" className="logo-img" />
          </NavLink>
        </div>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/" className="sidebar-item" onClick={() => isMobile && setSidebarOpen(false)}>
              <FaHome className="sidebar-icon" />
              <span className="sidebar-text">Trang chủ</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/my-blogs" className="sidebar-item" onClick={() => isMobile && setSidebarOpen(false)}>
              <MdArticle className="sidebar-icon" />
              <span className="sidebar-text">Bài viết của tôi</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/bookmarks" className="sidebar-item" onClick={() => isMobile && setSidebarOpen(false)}>
              <FaBookmark className="sidebar-icon" />
              <span className="sidebar-text">Đã lưu</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/create-blog" className="sidebar-item" onClick={() => isMobile && setSidebarOpen(false)}>
              <FaPen className="sidebar-icon" />
              <span className="sidebar-text">Tạo bài viết</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className="sidebar-item" onClick={() => isMobile && setSidebarOpen(false)}>
              <FaUser className="sidebar-icon" />
              <span className="sidebar-text">Hồ sơ</span>
            </NavLink>
          </li>
          {user && user.role === 'admin' && (
            <li>
              <NavLink to="/admin/posts" className="sidebar-item" onClick={() => isMobile && setSidebarOpen(false)}>
                <FaClipboardList className="sidebar-icon" />
                <span className="sidebar-text">Quản lí Dashboard</span>
              </NavLink>
            </li>
          )}
          <li>
            {user ? (
              <div className="sidebar-item" onClick={() => { handleLogout(); if(isMobile) setSidebarOpen(false); }}>
                <FaSignOutAlt className="sidebar-icon" />
                <span className="sidebar-text">Đăng xuất</span>
              </div>
            ) : (
              <NavLink to="/login" className="sidebar-item" onClick={() => isMobile && setSidebarOpen(false)}>
                <span className="sidebar-icon login-icon"></span>
                <span className="sidebar-text">Đăng nhập</span>
              </NavLink>
            )}
          </li>
        </ul>
        {user && (
          <div className="sidebar-user">
            <NavLink to="/profile" className="sidebar-item" onClick={() => isMobile && setSidebarOpen(false)}>
              <FaUser className="sidebar-icon" />
              <span className="sidebar-text">Xin chào, {user.name}</span>
            </NavLink>
          </div>
        )}
      </nav>
      {/* Overlay: chỉ hiện trên mobile khi sidebarOpen */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Header;
