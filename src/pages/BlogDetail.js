import React, { useState, useEffect } from 'react';
import '../styles/BlogDetail.css';
import '../styles/Reply.css';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { FaTrash } from 'react-icons/fa';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedComments, setExpandedComments] = useState([]);
  const [replyContent, setReplyContent] = useState('');
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
        setReplies(res.data.replies || []);
      } catch (err) {
        setComments([]);
        setReplies([]);
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

  const toggleReplies = (commentId) => {
    setExpandedComments(prev => {
      if (prev.includes(commentId)) {
        return prev.filter(id => id !== commentId);
      } else {
        return [...prev, commentId];
      }
    });
  };

  // ==== Xử lý trả lời bình luận (reply) ====
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyingTo) return;
    
    try {
      const response = await axios.post(
        `https://test-deploy-be.onrender.com/api/comments/${replyingTo}/reply`,
        { content: replyContent },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );
      
      const newReply = {
        ...response.data.reply,
        user: {
          name: user.name,
          _id: user._id
        }
      };
      setReplies(prev => [...prev, newReply]);
      setReplyContent('');
      setReplyingTo(null);
      
    } catch (error) {
      console.error('Lỗi khi trả lời bình luận:', error);
      alert('Trả lời bình luận thất bại');
    }
  };

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
      const newComment = {
        ...response.data.comment,
        user: {
          name: user.name,
          _id: user._id
        }
      };
      setComments(prev => [newComment, ...prev]);
      setCommentContent('');
    } catch (error) {
      console.error('Lỗi khi thêm bình luận:', error);
      alert('Thêm bình luận thất bại');
    }
  };

  const handleDeleteComment = async (commentId, isReply = false) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa ${isReply ? 'trả lời' : 'bình luận'} này?`)) return;
    try {
      await axios.delete(`https://test-deploy-be.onrender.com/api/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (isReply) {
        setReplies(prev => prev.filter(r => r._id !== commentId));
      } else {
        setComments(prev => prev.filter(c => c._id !== commentId));
        // When deleting a comment, also delete its replies
        setReplies(prev => prev.filter(r => r.parentId !== commentId));
      }
      
      alert(`Xóa ${isReply ? 'trả lời' : 'bình luận'} thành công`);
    } catch (err) {
      console.error(`Xóa ${isReply ? 'trả lời' : 'bình luận'} thất bại:`, err);
      alert(`Xóa ${isReply ? 'trả lời' : 'bình luận'} thất bại`);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa trả lời này?')) return;
    try {
      await axios.delete(`https://test-deploy-be.onrender.com/api/comments/reply/${replyId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      setReplies(prev => prev.filter(r => r._id !== replyId));
      alert('Xóa trả lời thành công');
    } catch (err) {
      console.error('Xóa trả lời thất bại:', err);
      alert('Xóa trả lời thất bại');
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
                      {user && (user.role === 'admin' || user._id === (comment.user?._id || comment.user)) && (
                        <button
                          className="comment-delete-btn"
                          title="Xóa bình luận"
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          <FaTrash />
                        </button>
                      )}
                      <p className="comment-author">
                        <strong>{comment.user?.name || comment.author || 'Ẩn danh'}</strong>
                        &nbsp;({comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('vi-VN') : ''}):
                      </p>
                      <p className="comment-content">{comment.content}</p>

                      <div className="comment-actions">
                        {user && (
                          <button
                            className="reply-btn"
                            onClick={() => setReplyingTo(comment._id)}
                          >
                            Trả lời
                          </button>
                        )}
                      </div>

                      {replyingTo === comment._id && (
                        <form onSubmit={handleReply} className="reply-form">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Nhập nội dung trả lời..."
                            required
                          />
                          <div className="reply-actions">
                            <button type="submit">Gửi</button>
                            <button 
                              type="button" 
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Hiển thị các replies */}
                      {(() => {
                        const commentReplies = replies.filter(reply => reply.parentId === comment._id);
                        const replyCount = commentReplies.length;
                        
                        if (replyCount === 0) return null;
                        
                        // Hiện số lượng replies nếu ≥ 3 và chưa mở rộng
                        if (replyCount >= 3 && !expandedComments.includes(comment._id)) {
                          return (
                            <button 
                              className="show-replies-btn"
                              onClick={() => toggleReplies(comment._id)}
                            >
                              Xem {replyCount} phản hồi
                            </button>
                          );
                        }

                        // Hiển thị replies khi đã mở rộng
                        return (
                          <div className="replies">
                            {replyCount >= 3 && (
                              <button 
                                className="hide-replies-btn"
                                onClick={() => toggleReplies(comment._id)}
                              >
                                Thu gọn phản hồi
                              </button>
                            )}
                            {commentReplies.map(reply => (
                              <div key={reply._id} className="reply-item">
                                {user && (user.role === 'admin' || user._id === (reply.user?._id || reply.user)) && (
                                  <button
                                    className="reply-delete-btn"
                                    title="Xóa trả lời"
                                    onClick={() => handleDeleteComment(reply._id, true)}
                                  >
                                    <FaTrash />
                                  </button>
                                )}
                                <p className="reply-author">
                                  <strong>{reply.user?.name || 'Ẩn danh'}</strong>
                                  &nbsp;({reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('vi-VN') : ''}):
                                </p>
                                <p className="reply-content">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
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
