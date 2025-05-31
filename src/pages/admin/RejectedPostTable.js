import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/RejectedPostTable.css';

const RejectedPostTable = () => {
  const [rejectedPosts, setRejectedPosts] = useState([]);
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  useEffect(() => {
    const fetchRejectedPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/admin/posts/rejected', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRejectedPosts(res.data);
      } catch (err) {
        console.error('❌ Lỗi khi tải bài bị từ chối:', err);
      }
    };
    fetchRejectedPosts();
  }, [token]);

  return (
    <div className="table-wrapper">
      <h2>Bài viết bị từ chối</h2>
      <table>
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Tác giả</th>
            <th>Ngày cập nhật</th>
          </tr>
        </thead>
        <tbody>
          {rejectedPosts.map((post) => (
            <tr key={post._id}>
              <td>{post.title}</td>
              <td>{post.userId?.name || 'Ẩn danh'}</td> {/* ✅ ĐÃ SỬA CHỖ NÀY */}
              <td>{new Date(post.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RejectedPostTable;
