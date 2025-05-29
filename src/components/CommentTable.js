import React from 'react';

const CommentTable = ({ comments, onDelete }) => (
  <table className="comment-table">
    <thead>
      <tr>
        <th>Nội dung</th>
        <th>Người bình luận</th>
        <th>Email</th>
        <th>Bài viết</th>
        <th>Ngày</th>
        <th>Thao tác</th>
      </tr>
    </thead>
    <tbody>
      {comments.length === 0 ? (
        <tr>
          <td colSpan={6} style={{ textAlign: 'center' }}>Chưa có bình luận nào.</td>
        </tr>
      ) : (
        comments.map((cmt) => (
          <tr key={cmt._id}>
            <td>{cmt.content}</td>
            <td>{cmt.user?.name || 'Ẩn danh'}</td>
            <td>{cmt.user?.email || ''}</td>
            <td>{cmt.post?.title || cmt.blog?.title || '---'}</td>
            <td>{new Date(cmt.createdAt).toLocaleString()}</td>
            <td>
              <button className="btn-delete" onClick={() => onDelete(cmt._id)}>
                Xoá
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

export default CommentTable;