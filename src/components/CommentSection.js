import React, { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles/CommentSection.css';

const CommentSection = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/blog/${blogId}`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Lỗi khi lấy bình luận:', error?.response?.data || error);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [blogId]);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!newComment.trim()) return;

  // Lấy token từ localStorage
  const userData = JSON.parse(localStorage.getItem('user'));
  const token = userData?.token;

  // Gửi API PHẢI có blogId (debug giá trị trước khi gửi)
  console.log("blogId gửi lên:", blogId); // Dòng này giúp debug

  await api.post('/comments', {
    blogId,
    content: newComment
  }, token ? {
    headers: { Authorization: `Bearer ${token}` }
  } : {});

  setNewComment('');
  fetchComments();
};

  return (
    <div className="comment-section">
      <h3>Bình luận</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Viết bình luận..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        />
        <button type="submit">Gửi</button>
      </form>
      <div className="comments">
        {comments.map((comment) => (
          <div key={comment._id} className="comment">
            <p>
              <strong>{comment.user?.name || "Ẩn danh"}</strong>: {comment.content}
            </p>
          </div>
        ))}
        {comments.length === 0 && <p>Chưa có bình luận nào.</p>}
      </div>
    </div>
  );
};

export default CommentSection;