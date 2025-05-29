import React, { useState, useEffect } from 'react';
import '../styles/BlogDetail.css';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  // Tải blog chi tiết + tăng view + bình luận
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`https://test-deploy-be.onrender.com/api/blogs/${id}`);
        setBlog(response.data.data);
        setLoading(false);

        // Tăng lượt xem
        await axios.put(`https://test-deploy-be.onrender.com/api/blogs/${id}`, {
          ...response.data.data,
          views: response.data.data.views + 1
        });
      } catch (error) {
        console.error('Lỗi khi lấy bài viết:', error);
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await axios.get(`https://test-deploy-be.onrender.com/api/comments/blog/${id}`);
        setComments(res.data.comments || []);
      } catch (err) {
        setComments([]);
        console.error('Lỗi khi lấy bình luận:', err);
      }
    };

    fetchBlog();
    fetchComments();
  }, [id]);

  // ==== Tải và lọc bài viết liên quan (theo tag chính) ====
  useEffect(() => {
    if (!blog || !Array.isArray(blog.tags) || blog.tags.length === 0) {
      setRelatedBlogs([]);
      return;
    }

    // Lấy tag chính, chuẩn hoá lại string
    let mainTag = blog.tags[0];
    while (Array.isArray(mainTag)) mainTag = mainTag[0];
    mainTag = typeof mainTag === 'string'
      ? mainTag.replace(/^[\[\]'"`]+|[\[\]'"`]+$/g, '').trim()
      : String(mainTag).replace(/^[\[\]'"`]+|[\[\]'"`]+$/g, '').trim();

    // Fetch toàn bộ blog rồi lọc theo tag chính
    const fetchRelated = async () => {
      try {
        const res = await axios.get('https://test-deploy-be.onrender.com/api/blogs');
        const allBlogs = res.data.data || [];
        // Lọc ra các bài có bất kỳ tag nào trùng tag chính (trừ bài hiện tại)
        const related = allBlogs.filter(item => {
          if (!item._id || item._id === blog._id) return false;
          if (!Array.isArray(item.tags)) return false;
          return item.tags.some(t => {
            while (Array.isArray(t)) t = t[0];
            t = typeof t === 'string'
              ? t.replace(/^[\[\]'"`]+|[\[\]'"`]+$/g, '').trim()
              : String(t).replace(/^[\[\]'"`]+|[\[\]'"`]+$/g, '').trim();
            return t === mainTag;
          });
        });
        setRelatedBlogs(related);
      } catch (err) {
        setRelatedBlogs([]);
        console.error('Lỗi khi load bài viết liên quan:', err);
      }
    };

    fetchRelated();
  }, [blog]);

  // ==== Xử lý bình luận ====
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    try {
      const response = await axios.post(
        `https://test-deploy-be.onrender.com/api/comments`,
        {
          blogId: id,
          content: commentContent
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );
      setComments(prev => [
        response.data.comment,
        ...prev
      ]);
      setCommentContent('');
    } catch (error) {
      console.error('Lỗi khi thêm bình luận:', error);
      alert('Thêm bình luận thất bại');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa bình luận này?')) return;
    try {
      await axios.delete(`https://test-deploy-be.onrender.com/api/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      setComments(prev => prev.filter(c => c._id !== commentId));
      alert('Xóa bình luận thành công');
    } catch (err) {
      console.error('Xóa bình luận thất bại:', err);
      alert('Xóa bình luận thất bại');
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (!blog) return <p>Không tìm thấy bài viết.</p>;

  return (
    <div className="blog-detail-container">
      <Header />
      <main>
        <div className="blog-main-grid">
          <div className="blog-main-left">
            <div className="blog-detail-content">
              {blog.image && (
                <img
                  src={
                    blog.image.startsWith('http')
                      ? blog.image
                      : `https://test-deploy-be.onrender.com${blog.image}`
                  }
                  alt={blog.title}
                  className="blog-detail-image"
                />
              )}

              <h2 className="blog-detail-title">{blog.title}</h2>

              <div className="blog-author" style={{ margin: '10px 0', fontSize: '15px', color: '#666' }}>
                <strong>Tác giả:</strong> {blog.userId?.name || 'Ẩn danh'}
              </div>

              <div className="blog-content-markdown">
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    img: ({ node, ...props }) => (
                      <figure style={{ textAlign: 'center', margin: '20px 0' }}>
                        <img
                          {...props}
                          style={{
                            maxWidth: '100%',
                            borderRadius: '10px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                        {props.alt && (
                          <figcaption
                            style={{
                              fontSize: '14px',
                              color: '#666',
                              marginTop: '8px',
                              fontStyle: 'italic'
                            }}>
                            {props.alt}
                          </figcaption>
                        )}
                      </figure>
                    )
                  }}
                >
                  {blog.content}
                </ReactMarkdown>
              </div>

              <div className="blog-meta">
                <span><strong>Tag:</strong> {blog.tags && blog.tags.length > 0 ? blog.tags.join(', ') : 'Không có tag'}</span>
                <span><strong>Ngày:</strong> {new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
               
                <span><strong>Trạng thái:</strong> {blog.status}</span>
              </div>

              <h3 className="comment-title">Bình luận</h3>
              <div className="comment-section">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment._id} className="comment-item">
                      <p className="comment-author">
                        <strong>{comment.user?.name || comment.author || 'Ẩn danh'}</strong>
                        &nbsp;({comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('vi-VN') : ''}):
                      </p>
                      <p className="comment-content">{comment.content}</p>
                      {user && (user.role === 'admin' || user._id === (comment.user?._id || comment.user)) && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p>Chưa có bình luận nào.</p>
                )}
              </div>

              {user ? (
                <form onSubmit={handleCommentSubmit} className="comment-form">
                  <div>
                    <label>Người bình luận:</label>
                    <input
                      type="text"
                      value={user.name}
                      disabled
                    />
                  </div>
                  <div>
                    <label>Nội dung:</label>
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit">Gửi</button>
                </form>
              ) : (
                <p style={{ fontStyle: "italic", color: "gray" }}>
                  ⚠️ Vui lòng <a href="/login">đăng nhập</a> để bình luận.
                </p>
              )}

              {/* ==== HIỂN THỊ TAG PHỤ DƯỚI COMMENT ==== */}
              
            </div>
          </div>

          <div className="blog-main-right">
            <div className="related-posts">
              <h3>Bài viết liên quan</h3>
              <div className="related-list">
                {relatedBlogs.length === 0 ? (
                  <p>Không có bài viết liên quan.</p>
                ) : (
                  relatedBlogs.map(rBlog => (
                    <Link to={`/blog/${rBlog._id}`} key={rBlog._id} className="related-item">
                      <img
                        src={
                          rBlog.image?.startsWith('http')
                            ? rBlog.image
                            : `https://test-deploy-be.onrender.com${rBlog.image}`
                        }
                        alt={rBlog.title}
                      />
                      <div className="related-item-content">
                        <p className="related-item-title">{rBlog.title}</p>
                        <p className="related-item-tags">
                          <strong>Tag:</strong> {rBlog.tags && rBlog.tags.length > 0 ? rBlog.tags.join(', ') : 'Không có tag'}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail;