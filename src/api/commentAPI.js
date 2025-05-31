import axios from 'axios';

// Hàm tạo comment mới
export const createComment = async (blogId, content, token) => {
  return axios.post('http://localhost:5001/api/comments', {
    blogId,
    content,
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Hàm lấy comment theo blogId
export const fetchCommentsByBlog = async (blogId) => {
  const res = await axios.get(`http://localhost:5001/api/comments/blog/${blogId}`);
  return res.data.comments || [];
};
