import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadFacebookSDK = () => {
      return new Promise((resolve) => {
        if (window.FB) return resolve();

        window.fbAsyncInit = function () {
          resolve();
        };

        if (!document.getElementById('facebook-jssdk')) {
          const script = document.createElement('script');
          script.id = 'facebook-jssdk';
          script.src = 'https://connect.facebook.net/en_US/sdk.js';
          script.async = true;
          script.defer = true;
          document.body.appendChild(script);
        }
      });
    };

    loadFacebookSDK().then(() => {
      if (window.FB) {
        window.FB.init({
          appId: process.env.REACT_APP_FACEBOOK_APP_ID || '9803103319753326',
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        });
      }
    });
  }, []);

  const handleFacebookLogin = () => {
    setLoading(true);

    if (!window.FB) {
      console.error('Facebook SDK not loaded');
      alert('Facebook SDK chưa được tải. Vui lòng thử lại sau.');
      setLoading(false);
      return;
    }

    window.FB.login(
      (response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          window.FB.api('/me', { fields: 'id,name,email' }, (userResponse) => {
            if (userResponse && !userResponse.error) {
              fetch('https://test-deploy-be.onrender.com/api/auth/facebook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken }),
              })
                .then(async res => {
                  let data = {};
                  try { data = await res.json(); } catch { data = {}; }
                  if (!res.ok || !data.success) {
                    alert(data.message || 'Đăng nhập Facebook thất bại!');
                    localStorage.removeItem('user');
                    setLoading(false);
                    return;
                  }
                  if (data.user?.isBlocked) {
                    alert('Tài khoản đã bị chặn bởi admin!');
                    localStorage.removeItem('user');
                    setLoading(false);
                    return;
                  }

                  const user = {
                    _id: data.user._id,
                    name: data.user.name,
                    email: data.user.email,
                    token: data.token,
                    role: data.user.role
                  };
                  localStorage.setItem('user', JSON.stringify(user));
                  alert('✅ Đăng nhập Facebook thành công!');
                  navigate('/');
                })
                .catch(() => {
                  alert('Lỗi khi xác thực Facebook');
                  setLoading(false);
                });
            } else {
              alert('Lỗi khi lấy thông tin Facebook');
              setLoading(false);
            }
          });
        } else {
          alert('Đăng nhập Facebook bị hủy hoặc thất bại.');
          setLoading(false);
        }
      },
      { scope: 'public_profile,email' }
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://test-deploy-be.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data = {};
      try { data = await res.json(); } catch { data = {}; }

      if (!res.ok || !data.success) {
        alert(data.message || 'Đăng nhập thất bại.');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      if (data.user?.isBlocked) {
        alert('Tài khoản đã bị chặn bởi admin!');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      alert('✅ Đăng nhập thành công!');
      const userWithToken = { ...data.user, token: data.token };
      localStorage.setItem('user', JSON.stringify(userWithToken));
      navigate('/');
    } catch (err) {
      alert('Đã xảy ra lỗi kết nối.');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <Header />
      <main>
        <div className="login-card">
          <h2>Đăng nhập</h2>
          <button onClick={handleFacebookLogin} disabled={loading} className="social-login-btn">
            <span className="facebook-icon"></span>
            {loading ? 'Đang xử lý...' : 'Đăng nhập với Facebook'}
          </button>
          <div style={{ marginTop: '25px', width: '100%' }}>
            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
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
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="normal-btn" disabled={loading}>
                Đăng nhập thường
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
