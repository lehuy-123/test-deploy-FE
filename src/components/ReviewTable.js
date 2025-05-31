import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ReviewTable.css';

const ReviewTable = () => {
  const [pendingPosts, setPendingPosts] = useState([]);

  const fetchPending = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/blogs?status=pending');
      setPendingPosts(res.data.data);
    } catch (err) {
      console.error('Lỗi khi lấy bài viết chờ duyệt:', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://localhost:5001/api/blogs/${id}/approve`, { status: 'approved' });
      setPendingPosts(pendingPosts.filter(post => post._id !== id));
    } catch (err) {
      console.error('Lỗi khi duyệt bài viết:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`http://localhost:5001/api/blogs/${id}/approve`, { status: 'rejected' });
      setPendingPosts(pendingPosts.filter(post => post._id !== id));
    } catch (err) {
      console.error('Lỗi khi từ chối bài viết:', err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="review-table">
      <h2>⏳ Bài viết chờ duyệt</h2>
      <table>
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Tác giả</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {pendingPosts.length === 0 ? (
            <tr>
              <td colSpan="4">Không có bài viết chờ duyệt.</td>
            </tr>
          ) : (
            pendingPosts.map(post => (
              <tr key={post._id}>
                <td>{post.title}</td>
                <td>{post.author?.name || 'Ẩn danh'}</td>
                <td>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <button onClick={() => handleApprove(post._id)}>✅ Duyệt</button>
                  <button onClick={() => handleReject(post._id)} className="danger">❌ Từ chối</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewTable;
