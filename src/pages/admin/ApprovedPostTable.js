import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import '../../styles/ApprovedPostTable.css';

const ApprovedPostTable = () => {
  const [approvedPosts, setApprovedPosts] = useState([]);
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  useEffect(() => {
    const fetchApprovedPosts = async () => {
      try {
        const res = await axios.get('https://test-deploy-be.onrender.com/api/admin/posts/approved', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApprovedPosts(res.data);
      } catch (err) {
        console.error('❌ Lỗi khi tải bài đã duyệt:', err);
      }
    };
    fetchApprovedPosts();
  }, [token]);

  const handleDraft = async (id) => {
    if (!window.confirm('Ẩn bài viết này?')) return;
    try {
      await axios.put(`https://test-deploy-be.onrender.com/api/admin/posts/${id}/draft`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApprovedPosts(posts => posts.map(p => p._id === id ? { ...p, status: 'draft' } : p));
    } catch (err) {
      alert('Ẩn thất bại!');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Bỏ ẩn và duyệt lại bài này?')) return;
    try {
      await axios.put(`https://test-deploy-be.onrender.com/api/admin/posts/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApprovedPosts(posts => posts.map(p => p._id === id ? { ...p, status: 'approved' } : p));
    } catch (err) {
      alert('Duyệt lại thất bại!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá vĩnh viễn bài viết này?')) return;
    try {
      await axios.delete(`https://test-deploy-be.onrender.com/api/admin/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApprovedPosts(posts => posts.filter(p => p._id !== id));
    } catch (err) {
      alert('Xoá thất bại!');
    }
  };

  return (
    <div className="table-wrapper">
      <h2>Bài viết đã duyệt</h2>
      <table className="approved-post-table">
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Tác giả</th>
            <th>Trạng thái</th>
            <th>Ngày cập nhật</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {approvedPosts.map((post) => (
            <tr key={post._id}>
              <td>
                <Link
                  to={`/admin/posts/${post._id}`}
                  className="approved-title-link"
                >
                  {post.title}
                </Link>
              </td>
              <td>{post.userId?.name || 'Ẩn danh'}</td>
              <td>
                {post.status === 'draft'
                  ? <span className="status-draft">Ẩn</span>
                  : <span className="status-approved">Đã duyệt</span>
                }
              </td>
              <td>{new Date(post.updatedAt).toLocaleString()}</td>
              <td>
                <div className="action-btn-group">
                  {post.status === 'approved' && (
                    <button className="btn-reject" onClick={() => handleDraft(post._id)}>Ẩn (draft)</button>
                  )}
                  {post.status === 'draft' && (
                    <button className="btn-approve" onClick={() => handleApprove(post._id)}>Bỏ ẩn</button>
                  )}
                  <button className="btn-delete" onClick={() => handleDelete(post._id)}>Xoá</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApprovedPostTable;
