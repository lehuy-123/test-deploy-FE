import React, { useEffect, useState } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import axios from 'axios';
import '../../styles/AdminTagManager.css';

function normalizeTag(tag) {
  if (typeof tag === 'string') {
    if (tag.startsWith('["') && tag.endsWith('"]')) {
      try {
        const arr = JSON.parse(tag);
        if (Array.isArray(arr)) return arr[0]?.trim() || '';
      } catch {}
    }
    return tag.replace(/^[\[\]"]+|[\[\]"]+$/g, '').trim();
  }
  return '';
}

function AdminTagManager() {
  const [allActualTags, setAllActualTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editingTags, setEditingTags] = useState([]);

  // Lấy token từ localStorage
  const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token || '';
  };

  // Lấy tất cả tag thực tế từng xuất hiện trên blog (chính/phụ)
  const fetchAllActualTags = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/tags/unique');
      setAllActualTags(res.data.tags || []);
    } catch {
      setAllActualTags([]);
    }
  };

  useEffect(() => {
    fetchAllActualTags();
  }, []);

  // Xoá tag khỏi toàn hệ thống
  const handleDeleteActualTagEverywhere = async (tagName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xoá tag "${tagName}" khỏi toàn bộ hệ thống?`)) return;
    try {
      const token = getToken();
      await axios.delete(`http://localhost:5001/api/tags/remove-from-all/${encodeURIComponent(tagName)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Đã xoá tag "${tagName}" khỏi toàn bộ hệ thống.`);
      fetchAllActualTags();
      setSelectedTag('');
      setBlogs([]);
    } catch {
      alert('Lỗi khi xoá tag khỏi hệ thống.');
    }
  };

  // SỬA Ở ĐÂY: Lấy toàn bộ tag (chính + phụ) của mọi blog, loại trùng, đồng bộ với hệ thống tag còn lại
  useEffect(() => {
    axios.get('http://localhost:5001/api/blogs')
      .then(res => {
        const blogs = res.data.data || [];
        let allTags = [];
        blogs.forEach(blog => {
          if (Array.isArray(blog.tags)) {
            blog.tags.forEach(tag => {
              const t = normalizeTag(tag);
              if (t) allTags.push(t);
            });
          }
        });
        // Lọc trùng & chỉ giữ tag chưa bị xoá khỏi hệ thống tag chính
        const uniqueValidTags = [...new Set(allTags)].filter(t => allActualTags.includes(t));
        setTags(uniqueValidTags);
      });
  }, [allActualTags]);

  useEffect(() => {
    if (selectedTag) {
      axios.get('http://localhost:5001/api/blogs')
        .then(res => {
          const blogs = res.data.data || [];
          const filtered = blogs.filter(blog =>
            Array.isArray(blog.tags) && blog.tags.some(t => normalizeTag(t) === selectedTag)
          );
          setBlogs(filtered);
        });
    } else {
      setBlogs([]);
    }
  }, [selectedTag]);

  const handleSaveTags = async () => {
    try {
      await axios.put(
        `http://localhost:5001/api/blogs/${editingBlog._id}`,
        { ...editingBlog, tags: editingTags },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      alert('Đã cập nhật tag thành công!');
      setBlogs(prev => prev.map(b =>
        b._id === editingBlog._id ? { ...b, tags: editingTags } : b
      ));
      setEditingBlog(null);
      fetchAllActualTags();
    } catch {
      alert('Cập nhật tag thất bại');
    }
  };

  return (
    <div className="admin-layout">
      <SidebarAdmin />
      <div className="admin-tag-container">
        <h2 className="admin-tag-header">Quản lý Tag toàn hệ thống</h2>

        {/* Danh sách tag hệ thống */}
        <div className="admin-tag-actual-section">
          <h3 className="admin-tag-actual-title">
            Tất cả tag từng xuất hiện trong blog 
            <span className="admin-tag-actual-note">(Xoá khỏi toàn hệ thống)</span>
          </h3>
          <div className="admin-tag-actual-list-row">
            {allActualTags.length === 0 ? (
              <span className="admin-tag-empty">Chưa có tag thực tế nào.</span>
            ) : (
              allActualTags.map(tagName => (
                <span key={tagName} className="admin-tag-actual-chip">
                  <span>{tagName}</span>
                  <button
                    className="admin-tag-delete-btn"
                    onClick={() => handleDeleteActualTagEverywhere(tagName)}
                  >
                    Xoá toàn hệ thống
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <hr className="admin-tag-hr" />
        <h3 className="admin-tag-sub-header">Quản lý Tag trong từng bài viết</h3>
        <div className="admin-tag-filter">
          <strong>Lọc theo tag:</strong>
          <select
            className="admin-tag-select"
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
          >
            <option value="">-- Chọn tag --</option>
            {tags.map(tag =>
              tag ? (
                <option key={tag} value={tag}>{tag}</option>
              ) : null
            )}
          </select>
        </div>

        {selectedTag && (
          <div>
            <h4 className="admin-tag-result-title">
              Các bài viết có tag <span className="admin-tag-highlight">"{selectedTag}"</span>:
            </h4>
            {blogs.length === 0 ? (
              <div className="admin-tag-empty">Không có bài nào.</div>
            ) : (
              <ul className="admin-tag-list">
                {blogs.map(blog => (
                  <li key={blog._id} className="admin-tag-blog-item">
                    <span>
                      <b className="admin-tag-title">{blog.title}</b>
                      <span className="admin-tag-taglist">
                        | Tag: {Array.isArray(blog.tags) ? blog.tags.map(normalizeTag).join(', ') : normalizeTag(blog.tags)}
                      </span>
                    </span>
                    <button
                      className="admin-tag-edit-btn"
                      onClick={() => {
                        setEditingBlog(blog);
                        setEditingTags(Array.isArray(blog.tags) ? blog.tags.map(normalizeTag) : []);
                      }}>
                      Sửa tag
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Popup chỉnh sửa tag */}
        {editingBlog && (
          <div className="admin-tag-edit-popup">
            <div className="admin-tag-edit-popup-inner">
              <div className="admin-tag-popup-title">
                Chỉnh sửa tag cho bài: <i>{editingBlog.title}</i>
              </div>
              <div className="admin-tag-edit-list">
                {editingTags.map((tag, idx) => (
                  <span className="admin-tag-edit-chip" key={idx}>
                    <input
                      value={tag}
                      className="admin-tag-edit-input"
                      onChange={e => {
                        const arr = [...editingTags];
                        arr[idx] = e.target.value;
                        setEditingTags(arr);
                      }}
                      placeholder={`Tag #${idx + 1}`}
                    />
                    <button
                      type="button"
                      className="admin-tag-edit-chip-delete"
                      onClick={() => {
                        const arr = [...editingTags];
                        arr.splice(idx, 1);
                        setEditingTags(arr);
                      }}
                      title="Xoá tag"
                    >×</button>
                  </span>
                ))}
                <button
                  className="admin-tag-popup-add-btn"
                  onClick={() => setEditingTags([...editingTags, ''])}
                >
                  + Thêm tag
                </button>
              </div>
              <div className="admin-tag-popup-action">
                <button
                  className="admin-tag-popup-save-btn"
                  onClick={handleSaveTags}
                >
                  Lưu
                </button>
                <button
                  className="admin-tag-popup-cancel-btn"
                  onClick={() => setEditingBlog(null)}
                >
                  Huỷ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminTagManager;
