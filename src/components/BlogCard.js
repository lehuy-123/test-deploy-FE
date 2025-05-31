import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BlogCard.css';
import { FaHeart, FaRegHeart, FaRegComment, FaShare, FaBookmark, FaRegBookmark } from 'react-icons/fa';

const BlogCard = ({ blog, user, onLikeToggle, onBookmarkToggle, safeArray }) => {
  const navigate = useNavigate();
  const isBookmarked = safeArray(blog.bookmarks).includes(user?._id);
  const isLiked = safeArray(blog.likes).includes(user?._id);

  return (
    <div className="blog-card">
      <div
        className="blog-card-clickable"
        onClick={() => navigate(`/blog/${blog._id}`)}
      >
        <div className="blog-card-image" style={{ position: 'relative' }}>
          <img
            src={
              blog?.image && blog.image.trim() !== ''
                ? (blog.image.startsWith('http')
                    ? blog.image
                    : `https://test-deploy-be.onrender.com${blog.image}`)
                : '/images/vne.png'
            }
            alt={blog.title}
            loading="lazy"
            onError={e => { e.target.onerror = null; e.target.src = '/images/vne.png'; }}
          />
          {Array.isArray(blog.tags) && blog.tags.length > 0 && typeof blog.tags[0] === 'string' && (
             <span className="blog-card-tag">{String(blog.tags[0]).replace(/[\[\],"]/g, '').trim()}</span>
          )}
        </div>
        <div className="blog-card-content">
          <h2 className="blog-card-title">{blog.title}</h2>
          <p className="blog-card-desc">{blog.content?.substring(0, 100)}...</p>
          <div className="blog-card-meta">
            <span className="blog-card-date">{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
            <img
              src={
                blog.author?.avatar && blog.author.avatar.trim() !== ''
                  ? blog.author.avatar
                  : '/images/placeholder.png'
              }
              alt="User"
              className="blog-card-avatar"
            />
          </div>
          {user?.role === 'admin' && (
            <div className="blog-card-status">
              <strong>Trạng thái: </strong>
              <span
                style={{
                  color:
                    blog.status === 'approved'
                      ? 'green'
                      : blog.status === 'pending'
                      ? 'orange'
                      : 'red'
                }}
              >
                {blog.status}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="blog-card-actions">
        <div className="blog-card-actions-left">
          <button
            className={`blog-card-like-btn ${isLiked ? 'liked' : ''}`}
            onClick={e => {
              e.stopPropagation();
              onLikeToggle(blog._id);
            }}
          >
            {isLiked
              ? <FaHeart className="blog-card-like-icon filled" />
              : <FaRegHeart className="blog-card-like-icon outline" />
            }
            {safeArray(blog.likes).length} Cảm xúc
          </button>
          <span
            className={`blog-card-bookmark-icon${isBookmarked ? ' saved' : ''}`}
            onClick={e => {
              e.stopPropagation();
              onBookmarkToggle(blog._id);
            }}
            title={isBookmarked ? "Đã lưu" : "Lưu bài viết"}
          >
            {isBookmarked
              ? <FaBookmark className="blog-card-bookmark-svg filled" />
              : <FaRegBookmark className="blog-card-bookmark-svg outline" />
            }
          </span>
        </div>
        <div className="blog-card-actions-right">
          <button
            className="blog-card-action-btn"
            onClick={e => {
              e.stopPropagation();
              navigate(`/blog/${blog._id}`);
            }}
          >
            <FaRegComment />
          </button>
          <button
            className="blog-card-action-btn"
            onClick={e => {
              e.stopPropagation();
              navigator.clipboard.writeText(`${window.location.origin}/blog/${blog._id}`);
            }}
          >
            <FaShare />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
