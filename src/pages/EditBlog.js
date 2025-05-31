import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/EditBlog.css';
import { useParams, useNavigate } from 'react-router-dom';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('');
  const [mainImages, setMainImages] = useState([]);
  const [previewMainImages, setPreviewMainImages] = useState([]);
  const [uploadedContentImages, setUploadedContentImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [originalStatus, setOriginalStatus] = useState(''); // trạng thái gốc của bài viết

  const textareaRef = useRef(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`https://test-deploy-be.onrender.com/api/blogs/${id}`);
        const blog = res.data.data;
        setTitle(blog.title || '');
        setContent(blog.content || '');
        setTags(Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''));
        setStatus(blog.status);
        setOriginalStatus(blog.status);
        if (blog.images && blog.images.length) {
          setPreviewMainImages(
            blog.images.map(img => img.startsWith('http') ? img : `https://test-deploy-be.onrender.com${img}`)
          );
        }
      } catch (error) {
        alert('Không tìm thấy bài viết');
      }
      setLoading(false);
    };
    fetchBlog();
  }, [id]);

  // Chọn ảnh banner (1 ảnh)
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImages([file]);
      setPreviewMainImages([URL.createObjectURL(file)]);
    } else {
      setMainImages([]);
      setPreviewMainImages([]);
    }
  };

  // Upload ảnh nội dung
  const handleContentImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const uploaded = [];
    for (let file of files) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await axios.post('https://test-deploy-be.onrender.com/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const url = res.data?.data?.imageUrl;
        if (url) {
          uploaded.push({
            file,
            url: url.startsWith('http') ? url : `https://test-deploy-be.onrender.com${url}`,
          });
        }
      } catch {}
    }
    setUploadedContentImages(prev => [...prev, ...uploaded]);
  };

  // Chèn ảnh vào markdown
  const handleInsertImage = (imgUrl) => {
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const before = content.substring(0, cursorPos);
    const after = content.substring(cursorPos);
    const markdownImg = `![](${imgUrl})\n`;
    setContent(before + markdownImg + after);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionEnd = cursorPos + markdownImg.length;
    }, 50);
  };

  // Chỉ cho phép chuyển "Bản nháp" (draft) hoặc "Đang chờ duyệt" (pending)
  const renderStatusOptions = () => {
    // Nếu bài gốc là pending, chỉ cho chọn pending hoặc draft
    if (originalStatus === 'pending') {
      return (
        <>
          <option value="pending">Đang chờ duyệt</option>
          <option value="draft">Bản nháp</option>
        </>
      );
    }
    // Nếu bài gốc là draft, cho chọn draft hoặc pending
    if (originalStatus === 'draft') {
      return (
        <>
          <option value="draft">Bản nháp</option>
          <option value="pending">Đang chờ duyệt</option>
        </>
      );
    }
    // Nếu bài gốc là approved, SỬA xong phải về lại pending, chỉ cho chọn draft hoặc pending (không cho user chọn approved)
    if (originalStatus === 'approved' || originalStatus === 'public') {
      return (
        <>
          <option value="pending">Đang chờ duyệt</option>
          <option value="draft">Bản nháp</option>
        </>
      );
    }
    // Mặc định (phòng trường hợp backend trả ra trạng thái lạ)
    return (
      <>
        <option value="pending">Đang chờ duyệt</option>
        <option value="draft">Bản nháp</option>
      </>
    );
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());

    // Tags dạng mảng
    const tagsArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    tagsArray.forEach(tag => formData.append('tags', tag));

    // Xử lý trạng thái gửi lên đúng workflow
    let submitStatus = status;
    if (originalStatus === 'approved' || originalStatus === 'public') {
      // Nếu bài đã duyệt thì user sửa, luôn về "pending" hoặc "draft"
      submitStatus = status === 'draft' ? 'draft' : 'pending';
    }
    if (originalStatus === 'pending') {
      // Nếu bài đang chờ duyệt thì chỉ được chọn giữa "pending" và "draft"
      submitStatus = status === 'draft' ? 'draft' : 'pending';
    }
    if (originalStatus === 'draft') {
      // Nếu là draft thì chỉ cho phép chọn draft hoặc pending
      submitStatus = status === 'pending' ? 'pending' : 'draft';
    }
    formData.append('status', submitStatus);

    // Ảnh banner (chỉ 1 ảnh)
    if (mainImages[0]) formData.append('image', mainImages[0]);

    try {
      await axios.put(`https://test-deploy-be.onrender.com/api/blogs/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Cập nhật thành công!');
      navigate('/my-blogs');
    } catch (error) {
      alert('Có lỗi khi cập nhật bài viết!');
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="edit-blog-page">
      <Header />
      <div className="edit-blog-form-container">
        <form className="edit-blog-form" onSubmit={handleSubmit}>
          <h2>Chỉnh sửa bài viết</h2>
          <div className="form-group">
            <label>Tiêu đề chính:</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Nhập tiêu đề bài viết"
            />
          </div>
         <div className="form-group">
            <label>Hình ảnh (banner chính):</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
            />
            <div className="image-preview-group">
              {previewMainImages.map((img, idx) => (
                <img src={img} alt={`main-preview-${idx}`} key={idx} className="img-preview" />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Nội dung (Markdown):</label>
            <textarea
              ref={textareaRef}
              rows={12}
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              placeholder="Viết nội dung bài viết của bạn (hỗ trợ Markdown)..."
            />
          </div>
          <div className="form-group">
            <label>Chèn ảnh vào nội dung (có thể chọn nhiều ảnh):</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleContentImageChange}
            />
            <div className="image-preview-group">
              {uploadedContentImages.map((img, idx) => (
                <div key={idx} className="img-insert-block">
                  <img src={img.url} alt={`content-img-${idx}`} className="img-preview" />
                  <button
                    type="button"
                    className="insert-btn"
                    onClick={() => handleInsertImage(img.url)}
                  >Chèn vào nội dung</button>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Tags (cách nhau bởi dấu phẩy):</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Ví dụ: thể thao, sức khỏe"
            />
          </div>
          <div className="form-group">
            <label>Trạng thái:</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              {renderStatusOptions()}
            </select>
          </div>
          <button type="submit" className="btn-submit">Cập nhật bài viết</button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditBlog;
