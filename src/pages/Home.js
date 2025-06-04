import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BlogCard from '../components/BlogCard';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [uniqueTags, setUniqueTags] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const safeArray = (value) => (Array.isArray(value) ? value : []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        let queryParams = [];
        if (user?.role !== 'admin') queryParams.push('status=approved');
        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        const res = await api.get(`/blogs${queryString}`);
        const blogsData = res.data.data || [];
        setBlogs(blogsData);

        const mainTags = new Set();
        blogsData.forEach((blog) => {
          if (Array.isArray(blog.tags) && blog.tags.length > 0) {
            let tag = blog.tags[0];
            while (Array.isArray(tag)) tag = tag[0];
            if (typeof tag === 'string') {
              tag = tag.replace(/^[\[\]'"`]+|[\[\]'"`]+$/g, '').trim();
              mainTags.add(tag);
            } else if (tag) {
              mainTags.add(String(tag).replace(/^[\[\]'"`]+|[\[\]'"`]+$/g, '').trim());
            }
          }
        });
        setUniqueTags(Array.from(mainTags));
      } catch (error) {
        console.error('Lỗi tải bài viết:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = filter
    ? blogs.filter((blog) =>
        Array.isArray(blog.tags) &&
        blog.tags.some((t) => {
          while (Array.isArray(t)) t = t[0];
          t = typeof t === 'string'
            ? t.replace(/^[\[\]'"`]+|[\[\]'"`]+$/g, '').trim()
            : String(t).replace(/^[\[\]'"`]+|[\[\]'"`]+$/g, '').trim();
          return t === filter;
        })
      )
    : blogs;

  const handleLikeToggle = async (blogId) => {
    if (!user) {
      alert('Bạn cần đăng nhập để thả cảm xúc!');
      return;
    }
    try {
      const res = await api.post(`/blogs/${blogId}/like`, { userId: user._id });
      if (res.data?.data) {
        const updatedBlog = res.data.data;
        setBlogs((prev) =>
          prev.map((b) => (b._id === blogId ? { ...b, ...updatedBlog } : b))
        );
      }
    } catch (error) {
      console.error('Lỗi khi thả cảm xúc:', error);
    }
  };

  const handleBookmarkToggle = async (blogId) => {
    if (!user) {
      alert('Bạn cần đăng nhập để lưu bài viết!');
      return;
    }
    try {
      const res = await api.post(`/blogs/${blogId}/bookmark`, { userId: user._id });
      if (res.data?.data) {
        const updatedBlog = res.data.data;
        setBlogs((prev) =>
          prev.map((b) => (b._id === blogId ? { ...b, ...updatedBlog } : b))
        );
      }
    } catch (error) {
      console.error('Lỗi khi lưu bài viết:', error);
    }
  };

  return (
    <div className="home-container">
      <Header />
      <main className="home-content">
      <section className="hero-section">
  <div className="hero-content">
    <h1> Chào mừng bạn đến với <span>BLOGLIFE</span></h1>
    <p>
      Nơi chia sẻ những kiến thức, cảm hứng, và câu chuyện thú vị mỗi ngày. 
      Khám phá và để lại dấu ấn của bạn nhé!
    </p>
    <div className="filter-bar">
      <select
        className="main-filter-select"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="">-- Lọc theo tag chính --</option>
        {uniqueTags.map((tag) => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>
    </div>
  </div>
</section>


        <div className="blogs-section">
          {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="skeleton"></div>)
          ) : filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => (
              <div className="blogs-section-item" key={blog._id}>
                <BlogCard
                  blog={blog}
                  user={user}
                  safeArray={safeArray}
                  onLikeToggle={handleLikeToggle}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              </div>
            ))
          ) : (
            <p className="loading-text">Không có bài viết nào.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
