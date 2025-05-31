import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Login.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        alert('🎉 Đăng ký thành công! Bạn có thể đăng nhập ngay.');
        navigate('/login');
      } else {
        alert(data.message || 'Đăng ký thất bại.');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert('Đã xảy ra lỗi.');
    }
  };

  return (
    <div className="login">
      <Header />
      <main>
        <div className="login-card">
          <h2>Đăng ký tài khoản</h2>
          <form onSubmit={handleRegister} className="login-form">
            <div className="input-group">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="Họ tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <span className="input-icon">📧</span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="normal-btn">Đăng ký</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '15px' }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
