import axios from 'axios';

// Hàm tạo comment mới
export const createComment = async (blogId, content, token) => {
  return axios.post('https://test-deploy-be.onrender.com/api/comments', {
    blogId,
    content,
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Hàm lấy comment theo blogId
export const fetchCommentsByBlog = async (blogId) => {
  const res = await axios.get(`https://test-deploy-be.onrender.com/api/comments/blog/${blogId}`);
  return res.data.comments || [];
};
