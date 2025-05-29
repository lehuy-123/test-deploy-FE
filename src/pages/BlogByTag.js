import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/BlogByTag.css';
import api from '../api/api';

const BlogByTag = () => {
  const { tag } = useParams();
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.get(`/blogs?tags_like=${tag}`);
        setBlogs(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy bài viết theo tag:', error);
      }
    };
    fetchBlogs();
  }, [tag]);

  return (
    <div className="blog-by-tag">
      <Header />
      <main>
        <h2>Bài viết với tag: {tag}</h2>
        <div className="blog-grid">
          {blogs.map((blog) => (
            <div key={blog.id} className="blog-item">
              <img src={blog.image} alt={blog.title} loading="lazy" />
              <h3>{blog.title}</h3>
              <Link to={`/blog/${blog.id}`}>Xem chi tiết</Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogByTag;