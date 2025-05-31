import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/EditUserProfile.css';
import api from '../api/api';

const EditUserProfile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // ✅ Lấy token đúng cách
  const getToken = () => {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    try {
      const parsed = JSON.parse(userData);
      return parsed.token || null;
    } catch (e) {
      return null;
    }
  };

  // ✅ Hàm fetch thông tin người dùng
  const fetchUser = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = res.data.data;
      setUserId(user._id);
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatarPreview(user.avatar ? `http://localhost:5001${user.avatar}` : null);

      // ✅ Lưu lại user mới vào localStorage
      localStorage.setItem('user', JSON.stringify({ ...user, token }));
    } catch (err) {
      console.error('Lỗi khi fetch user:', err);
      setError('Không thể tải thông tin người dùng.');
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchUser();
  }, [navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim()) {
      setError('Vui lòng điền đầy đủ họ tên và email.');
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        setError('Bạn chưa đăng nhập.');
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (avatar) {
        formData.append('avatar', avatar);
      }

      const res = await api.put('/auth/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setSuccess('Cập nhật thành công!');
        await fetchUser();
      } else {
        setError(res.data.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật profile:', err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.';
      setError(msg);
    }
  };

  return (
    <div className="edit-user-profile">
      <Header />
      <main>
        <h2>Chỉnh sửa hồ sơ</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="avatar-section">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar Preview" className="preview-image" />
            ) : (
              <div className="avatar-placeholder">Chưa có avatar</div>
            )}
            <div className="avatar-buttons">
              <label className="choose-avatar">
                Tải ảnh mới
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Họ tên</label>
            <input
              type="text"
              placeholder="Tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-buttons">
            <button type="submit" className="update-button">
              Cập nhật
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default EditUserProfile;
