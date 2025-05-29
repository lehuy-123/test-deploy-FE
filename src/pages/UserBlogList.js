import React, { useState, useEffect } from 'react';
import '../styles/UserBlogList.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const UserBlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedBlogs, setLikedBlogs] = useState({});
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

  useEffect(() => {
    if (blogs.length > 0 && user) {
      const initialLikes = {};
      blogs.forEach((blog) => {
        initialLikes[blog._id] = blog.likes.includes(user._id);
      });
      setLikedBlogs(initialLikes);
    }
  }, [blogs, user]);

  const handleLikeToggle = async (blogId) => {
    try {
      if (!user || !user._id) {
        alert('Bạn cần đăng nhập để thả cảm xúc!');
        return;
      }

      const response = await axios.post(`https://test-deploy-be.onrender.com/api/blogs/${blogId}/like`, {
        userId: user._id,
      });

      const updatedBlog = response.data.data;

      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) => (blog._id === blogId ? updatedBlog : blog))
      );

      setLikedBlogs((prev) => ({
        ...prev,
        [blogId]: updatedBlog.likes.includes(user._id),
      }));
    } catch (error) {
      console.error('Lỗi khi thả cảm xúc:', error);
    }
  };

  if (loading) {
    return (
      <div className="user-blogs-container">
        <Header />
        <main className="user-blogs-content">
          <h1 className="main-title">Danh sách bài viết</h1>
          <div className="blogs-list">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="skeleton"></div>
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
        <h1 className="main-title">Danh sách bài viết</h1>
        <div className="blogs-list">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
             <div key={blog._id} className="blog-card-horizontal">
              <Link to={`/blog/${blog._id}`}
               className="card-horizontal-wrapper link-wrapper"
               style={{ textDecoration: 'none', color: 'inherit' }} >
                 <div className="card-horizontal-image" style={{ position: 'relative' }}>
                  <span className={`blog-status-badge ${blog.status === 'approved' ? 'badge-approved' : 'badge-draft'}`}>
                     {blog.status === 'approved' ? 'Đã duyệt' : blog.status === 'draft' ? 'Bản nháp' : blog.status}
                      </span>
                      <img
                       src={blog.image && blog.image.trim() !== ''? (blog.image.startsWith('http')? blog.image: `https://test-deploy-be.onrender.com${blog.image}`) : '/images/vne.png'}
                       alt={blog.title}
                       loading="lazy"
                        onError={e => { e.target.onerror = null; e.target.src = '/images/vne.png'; }}
                        />
                </div>
    <div className="card-horizontal-content">
      <h2 className="card-title">{blog.title}</h2>
      <div className="card-meta">
        <span>Ngày tạo: {new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
      </div>
    </div>
  </Link>
  <div className="blog-actions">
    <Link to={`/edit-blog/${blog._id}`} className="edit-btn">Sửa</Link>
    <button
      className="delete-btn"
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
      Xóa
    </button>
  </div>
  <div className="card-actions">
    <button
      className={`action-btn like ${likedBlogs[blog._id] ? 'liked' : ''}`}
      onClick={() => handleLikeToggle(blog._id)}
    >
      {Array.isArray(blog.likes) ? blog.likes.length : 0} cảm xúc
    </button>
    <button className="action-btn comment"></button>
    <button className="action-btn share"></button>
  </div>
</div> ))) :(<p className="loading-text">Không có bài viết nào.</p>  )} </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserBlogList;