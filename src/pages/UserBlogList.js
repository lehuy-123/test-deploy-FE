import React, { useState, useEffect } from 'react';
import '../styles/UserBlogList.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaEdit, FaTrash } from 'react-icons/fa';

const UserBlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user._id) {
          setBlogs([]);
          return;
        }
        const response = await axios.get(`https://test-deploy-be.onrender.com/api/blogs/user/${user._id}`);
        setBlogs(response.data.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bài viết:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="user-blogs-container">
        <Header />
        <main className="user-blogs-content">
          <h1 className="user-main-title">Danh sách bài viết</h1>
          <div className="user-blogs-list">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="user-skeleton"></div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="user-blogs-container">
      <Header />
      <main className="user-blogs-content">
        <h1 className="user-main-title">Danh sách bài viết</h1>
        <div className="user-blogs-list">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div key={blog._id} className="user-blog-card-horizontal">
                <Link
                  to={`/blog/${blog._id}`}
                  className="user-card-horizontal-wrapper"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="user-card-horizontal-image" style={{ position: 'relative' }}>
                    <span className={`user-blog-status-badge ${blog.status === 'approved' ? 'user-badge-approved' : 'user-badge-draft'}`}>
                      {blog.status === 'approved' ? 'Đã duyệt' : blog.status === 'draft' ? 'Bản nháp' : blog.status}
                    </span>
                    <img
                      src={blog.image && blog.image.trim() !== ''
                        ? (blog.image.startsWith('http')
                          ? blog.image
                          : `https://test-deploy-be.onrender.com${blog.image}`)
                        : '/images/vne.png'}
                      alt={blog.title}
                      loading="lazy"
                      onError={e => { e.target.onerror = null; e.target.src = '/images/vne.png'; }}
                    />
                  </div>
                  <div className="user-card-horizontal-content">
                    <h2 className="user-card-title">{blog.title}</h2>
                    <p className="user-card-desc">
                      {blog.content ? blog.content.slice(0, 120) + (blog.content.length > 120 ? '...' : '') : ''}
                    </p>
                    <div className="user-card-meta">
                      <span>Ngày tạo: {new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </Link>
                <div className="user-blog-actions user-blog-actions-flex">
                  <Link to={`/edit-blog/${blog._id}`} className="user-edit-btn" title="Sửa">
                    <FaEdit className="icon-edit" />
                  </Link>
                  <button
                    className="user-delete-btn"
                    title="Xóa"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
                        try {
                          await axios.delete(`https://test-deploy-be.onrender.com/api/blogs/${blog._id}`);
                          setBlogs(blogs.filter((b) => b._id !== blog._id));
                        } catch (error) {
                          console.error('Lỗi khi xóa bài viết:', error);
                        }
                      }
                    }}
                  >
                    <FaTrash className="icon-trash" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="user-loading-text">Không có bài viết nào.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserBlogList;
