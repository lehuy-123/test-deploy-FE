import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

import { FaHome, FaPen, FaUser, FaSignOutAlt, FaBookmark, FaClipboardList } from 'react-icons/fa';
import { MdArticle } from 'react-icons/md';
import api from '../api/api';

const Header = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData)); // Cập nhật localStorage
      }
    } catch (err) {
      console.error('Lỗi khi fetch user:', err);
    }
  };

  useEffect(() => {
    fetchUser(); // Lấy dữ liệu ban đầu

    // Lắng nghe sự kiện userUpdated từ EditUserProfile
    const handleUserUpdate = () => {
      fetchUser();
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    // Cleanup sự kiện khi component unmount
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null); // Cập nhật state
    navigate('/login');
  };

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <NavLink to="/">
          <img src="/images/new logo.png" alt="Logo" className="logo-img" />
        </NavLink>
      </div>

      {/* Sidebar Menu */}
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/" className="sidebar-item" activeClassName="active">
            <FaHome className="sidebar-icon" />
            <span className="sidebar-text">Trang chủ</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/my-blogs" className="sidebar-item" activeClassName="active">
            <MdArticle className="sidebar-icon" />
            <span className="sidebar-text">Bài viết của tôi</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/bookmarks" className="sidebar-item" activeClassName="active">
            <FaBookmark className="sidebar-icon" />
            <span className="sidebar-text">Đã lưu</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/create-blog" className="sidebar-item" activeClassName="active">
            <FaPen className="sidebar-icon" />
            <span className="sidebar-text">Tạo bài viết</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/profile" className="sidebar-item" activeClassName="active">
            <FaUser className="sidebar-icon" />
            <span className="sidebar-text">Hồ sơ</span>
          </NavLink>
        </li>

        {/* ✅ Mục admin: Duyệt bài viết */}
        {user && user.role === 'admin' && (
          <li>
            <NavLink to="/admin/posts" className="sidebar-item" activeClassName="active">
              <FaClipboardList className="sidebar-icon" />
              <span className="sidebar-text">Quản lí DoasBoard</span>
            </NavLink>
          </li>
        )}

        <li>
          {user ? (
            <div className="sidebar-item" onClick={handleLogout}>
              <FaSignOutAlt className="sidebar-icon" />
              <span className="sidebar-text">Đăng xuất</span>
            </div>
          ) : (
            <NavLink to="/login" className="sidebar-item" activeClassName="active">
              <span className="sidebar-icon login-icon"></span>
              <span className="sidebar-text">Đăng nhập</span>
            </NavLink>
          )}
        </li>

      </ul>

      {user && (
        <div className="sidebar-user">
          <NavLink to="/profile" className="sidebar-item" activeClassName="active">
            <FaUser className="sidebar-icon" />
            <span className="sidebar-text">Xin chào, {user.name}</span>
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default Header;