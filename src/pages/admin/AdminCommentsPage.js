// src/pages/admin/AdminCommentsPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarAdmin from '../../components/SidebarAdmin';
import CommentTable from '../../components/CommentTable';
import '../../styles/AdminCommentsPage.css';

const AdminCommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await axios.get('https://test-deploy-be.onrender.com/api/comments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComments(res.data);
      } catch (err) {
        console.error('Lỗi khi tải bình luận:', err);
        setComments([]);
      }
      setLoading(false);
    };
    fetchComments();
  }, [token]);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá bình luận này không?')) {
      try {
        await axios.delete(`https://test-deploy-be.onrender.com/api/comments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComments((prev) => prev.filter(c => c._id !== id));
      } catch (err) {
        alert('Xoá thất bại!');
        console.error('Xoá thất bại:', err);
      }
    }
  };

  return (
    <div className="admin-container">
      <SidebarAdmin />
      <div className="admin-main">
        <h2>🗨️ Quản lý bình luận</h2>
        {loading ? (
          <div className="loading-text">Đang tải dữ liệu...</div>
        ) : (
          <CommentTable comments={comments} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
};

export default AdminCommentsPage;