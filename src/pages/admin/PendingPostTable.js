import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // ✅ Thêm Link để chuyển trang chi tiết
import '../../styles/PendingPostTable.css';

const PendingPostTable = () => {
  const [pendingPosts, setPendingPosts] = useState([]);
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  useEffect(() => {
    const fetchPendingPosts = async () => {
      try {
        const res = await axios.get('https://test-deploy-be.render.com/api/admin/posts/pending', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingPosts(res.data);
      } catch (err) {
        console.error('❌ Lỗi khi tải bài viết chờ duyệt:', err);
      }
    };
    fetchPendingPosts();
  }, [token]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`https://test-deploy-be.render.com/api/admin/posts/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingPosts(pendingPosts.filter(post => post._id !== id));
      alert("✅ Duyệt bài viết thành công");
    } catch (err) {
      console.error('❌ Lỗi khi duyệt bài viết:', err);
      alert("❌ Duyệt bài viết thất bại");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`https://test-deploy-be.render.com/api/admin/posts/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingPosts(pendingPosts.filter(post => post._id !== id));
      alert("⚠️ Bài viết đã bị từ chối");
    } catch (err) {
      console.error('❌ Lỗi khi từ chối bài viết:', err);
      alert("❌ Từ chối bài viết thất bại");
    }
  };

  return (
    <div className="table-wrapper">
      <h2>Bài viết chờ duyệt</h2>
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
          {pendingPosts.map((post) => (
            <tr key={post._id}>
              <td>
                <Link
                  to={`/admin/posts/${post._id}`}
                  style={{ color: "#1a73e8", textDecoration: "underline", cursor: "pointer" }}
                >
                  {post.title}
                </Link>
              </td>
              <td>{post.userId?.name || 'Ẩn danh'}</td>
              <td>{new Date(post.createdAt).toLocaleString()}</td>
              <td>
                <button onClick={() => handleApprove(post._id)} className="btn-approve">Duyệt</button>
                <button onClick={() => handleReject(post._id)} className="btn-reject">Từ chối</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingPostTable;