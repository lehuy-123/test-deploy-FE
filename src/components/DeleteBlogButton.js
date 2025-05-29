import React, { useState } from 'react';
import api from '../api/api';
import '../styles/DeleteBlogButton.css';

const DeleteBlogButton = ({ blogId, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await api.delete(`/blogs/${blogId}`);
      onDelete(blogId);
      setShowConfirm(false);
      alert('Xóa bài viết thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
      alert('Xóa bài viết thất bại.');
    }
  };

  return (
    <div>
      <button onClick={() => setShowConfirm(true)}>Xóa</button>
      {showConfirm && (
        <div className="confirm-popup">
          <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
          <button onClick={handleDelete}>Xóa</button>
          <button onClick={() => setShowConfirm(false)}>Hủy</button>
        </div>
      )}
    </div>
  );
};

export default DeleteBlogButton;