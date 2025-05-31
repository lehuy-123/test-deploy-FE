import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import '../../styles/AdminPostDetail.css';

const AdminPostDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/blogs/${id}`);
        setBlog(res.data.data);
        setLoading(false);
      } catch (error) {
        alert('Không tìm thấy bài viết');
        navigate('/admin/posts');
      }
    };
    fetchBlog();
  }, [id, navigate]);

  // Duyệt bài
  const handleApprove = async () => {
    if (!window.confirm("Duyệt bài viết này?")) return;
    try {
      await axios.put(`http://localhost:5001/api/admin/posts/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Đã duyệt bài viết!");
      navigate('/admin/posts');
    } catch {
      alert("Duyệt thất bại");
    }
  };

  // Ẩn (draft)
  const handleDraft = async () => {
    if (!window.confirm("Ẩn (set draft) bài viết này?")) return;
    try {
      await axios.put(`http://localhost:5001/api/admin/posts/${id}/draft`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Đã ẩn bài viết!");
      navigate('/admin/posts');
    } catch {
      alert("Ẩn thất bại");
    }
  };

  // Xoá
  const handleDelete = async () => {
    if (!window.confirm("Xoá vĩnh viễn bài viết này?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/admin/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Đã xoá bài viết!");
      navigate('/admin/posts');
    } catch {
      alert("Xoá thất bại");
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!blog) return <div>Không tìm thấy bài viết.</div>;

  return (
    <div className="admin-post-detail-container">
      <Link to="/admin/posts" className="admin-post-back">← Quay lại danh sách</Link>
      <div className="admin-post-detail-card">
        <h2 className="admin-post-title">{blog.title}</h2>
        <div className="admin-post-author">
          <strong>Tác giả:</strong> {blog.userId?.name || 'Ẩn danh'}
        </div>
        <div className="admin-post-meta">
          <span><strong>Tag:</strong> {blog.tags && blog.tags.length > 0 ? blog.tags.join(', ') : 'Không có tag'}</span>
          <span><strong>Ngày:</strong> {new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
          <span><strong>Trạng thái:</strong> {blog.status}</span>
        </div>
        <div className="admin-post-content">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{blog.content}</ReactMarkdown>
        </div>
        {(blog.status === 'pending' || blog.status === 'approved') && (
          <div className="admin-post-action-bar">
            {blog.status === 'pending' && (
              <button className="btn-approve" onClick={handleApprove}>Duyệt</button>
            )}
            <button className="btn-reject" onClick={handleDraft}>Ẩn (draft)</button>
            <button className="btn-delete" onClick={handleDelete}>Xoá</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPostDetail;

