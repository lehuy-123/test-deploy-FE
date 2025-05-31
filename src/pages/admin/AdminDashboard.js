import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarAdmin from '../../components/SidebarAdmin';
import StatsCard from '../../components/StatsCard';
import ChartBox from '../../components/ChartBox';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    monthlyBlogs: [],
    monthlyComments: [],
    monthlyUsers: [],
    monthlyTags: Array(12).fill(0), // Thêm giá trị mặc định
  });
  const [tagCount, setTagCount] = useState(0); // Thêm state cho số lượng tag

  const token = JSON.parse(localStorage.getItem('user'))?.token;

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        return window.location.href = '/login';
      }

      try {
        const res = await axios.get('http://localhost:5001/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = res.data;
        setStats(prev => ({
          ...prev,
          totalUsers: data.totalUsers || 0,
          totalPosts: data.totalPosts || 0,
          totalComments: data.totalComments || 0,
          monthlyBlogs: data.monthlyBlogs || [],
          monthlyComments: data.monthlyComments || [],
          monthlyUsers: data.monthlyUsers || [],
        }));

      } catch (error) {
        console.error('❌ Lỗi lấy dữ liệu thống kê:', error);
        if (error.response?.status === 403) {
          alert('Bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    };

    // Gọi API thống kê tổng quát
    fetchStats();

    // Gọi API lấy số lượng tag thực tế
    axios.get('http://localhost:5001/api/tags/unique')
      .then(res => setTagCount(res.data.tags?.length || 0))
      .catch(() => setTagCount(0));

    // Gọi API lấy thống kê tag theo tháng để đổ lên biểu đồ
    axios.get('http://localhost:5001/api/tags/monthly')
      .then(res => {
        setStats(prev => ({
          ...prev,
          monthlyTags: res.data.monthlyTags || Array(12).fill(0)
        }))
      })
      .catch(() => {
        setStats(prev => ({
          ...prev,
          monthlyTags: Array(12).fill(0)
        }))
      });
  }, [token]);

  return (
    <div className="admin-container">
      <SidebarAdmin />
      <div className="admin-content">
        <h1>📊 Bảng điều khiển quản trị</h1>
        <div className="card-grid">
          <StatsCard title="Người dùng" value={stats.totalUsers} color="#6c5ce7" />
          <StatsCard title="Bài viết" value={stats.totalPosts} color="#00cec9" />
          <StatsCard title="Bình luận" value={stats.totalComments} color="#fdcb6e" />
          <StatsCard title="Tag" value={tagCount} color="#d63031" />
        </div>

        <div className="chart-section">
          <h2 style={{ marginTop: '30px' }}>🗓️ Biểu đồ theo tháng</h2>
          <ChartBox
            blogs={stats.monthlyBlogs}
            comments={stats.monthlyComments}
            users={stats.monthlyUsers}
            tags={stats.monthlyTags}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
