import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/SidebarAdmin.css';

const SidebarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Dùng để active menu

  // Định nghĩa danh sách menu cho chuyên nghiệp và dễ chỉnh sửa
  const menu = [
    { path: '/admin', label: '📊 Dashboard' },
    { path: '/admin/users', label: '👥 Người dùng' },
    { path: '/admin/posts', label: '📝 Bài viết' },
    { path: '/admin/comments', label: '🗨️ Bình luận' },
    { path: '/admin/tags', label: '🏷️ Quản lý Tag' }, // Thêm mục quản lý tag
    { path: '/', label: '⬅️ Quay lại Blog' },
  ];

  return (
    <div className="sidebar-admin">
      <h2 className="logo">🔧 Admin</h2>
      <ul>
        {menu.map((item) => (
          <li
            key={item.path}
            onClick={() => navigate(item.path)}
            className={location.pathname === item.path ? 'active' : ''}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarAdmin;