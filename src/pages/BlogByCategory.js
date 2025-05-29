import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api/api';
import '../styles/BlogByCategory.css';

const BlogByCategory = () => {
  const { category } = useParams();
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.get(`/blogs?category=${category}`);
        setBlogs(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy bài viết:', error);
      }
    };
    fetchBlogs();
  }, [category]);

  return (
    <div className="blog-by-category">
      <Header />
      <main>
        <h2>Bài viết trong danh mục: {category}</h2>
        <div className="blog-grid">
          {blogs.map((blog) => (
            <div key={blog.id} className="blog-item">
              <Link to={`/blog/${blog.id}`}>
                <img src={blog.image} alt={blog.title} />
                <h3>{blog.title}</h3>
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogByCategory;