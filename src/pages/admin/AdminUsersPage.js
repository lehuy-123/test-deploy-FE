import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarAdmin from '../../components/SidebarAdmin';
import '../../styles/AdminUsersPage.css';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const localUser = JSON.parse(localStorage.getItem('user'));
  const token = localUser?.token;
  const currentUserId = localUser?.user?._id;

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchUsers();
  }, [search, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/users?search=${search}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('❌ Lỗi lấy danh sách người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      await axios.patch(`http://localhost:5001/api/users/${id}/block`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật trạng thái người dùng:', err);
      alert('Không thể thay đổi trạng thái người dùng');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('⚠️ Bạn có chắc muốn xoá người dùng này?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5001/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error('❌ Lỗi khi xoá người dùng:', err);
      alert('Không thể xoá người dùng');
    }
  };

  const handleToggleRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirm = window.confirm(`Bạn có chắc muốn đổi vai trò sang "${newRole}"?`);
    if (!confirm) return;

    try {
      await axios.patch(`http://localhost:5001/api/users/${id}/role`, {
        role: newRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchUsers();
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật vai trò:', err);
      alert('Không thể cập nhật vai trò người dùng');
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.patch(`http://localhost:5001/api/users/${id}/info`, {
        name: editName,
        email: editEmail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditUserId(null);
      setEditName('');
      setEditEmail('');
      fetchUsers();
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật thông tin người dùng:', err);
      alert('Không thể cập nhật thông tin người dùng');
    }
  };

  return (
    <div className="admin-container">
      <SidebarAdmin />

      <div className="admin-content">
        <h2 className="page-title">👤 Quản lý người dùng</h2>

        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên hoặc email..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="search-input"
        />

        {loading ? (
          <p className="loading-text">Đang tải dữ liệu...</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="5" className="no-data">Không tìm thấy người dùng nào.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user._id}>
                    <td>
                      {editUserId === user._id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : user.name}
                    </td>
                    <td>
                      {editUserId === user._id ? (
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                      ) : user.email}
                    </td>
                    <td>{user.role === 'admin' ? '👑 Quản trị' : '👤 Người dùng'}</td>
                    <td>
                      <span className={user.isBlocked ? 'status blocked' : 'status active'}>
                        {user.isBlocked ? '⛔ Đã chặn' : '✅ Bình thường'}
                      </span>
                    </td>
                    <td>
                      {user._id !== currentUserId && (
                        <>
                          {editUserId === user._id ? (
                            <>
                              <button className="btn save" onClick={() => handleSaveEdit(user._id)}>Lưu</button>
                              <button className="btn cancel" onClick={() => setEditUserId(null)}>Huỷ</button>
                            </>
                          ) : (
                            <button
                              className="btn edit"
                              onClick={() => {
                                setEditUserId(user._id);
                                setEditName(user.name);
                                setEditEmail(user.email);
                              }}
                            >
                              ✏️ Sửa
                            </button>
                          )}
                          <button
  onClick={() => handleToggleRole(user._id, user.role)}
  className={`btn toggle-role ${user.role === 'admin' ? 'demote' : 'promote'}`}
>
  {user.role === 'admin' ? ' Thu quyền' : ' Cấp quyền'}
</button>

                          <button
                            onClick={() => handleToggleBlock(user._id)}
                            className={user.isBlocked ? 'btn unblock' : 'btn block'}
                          >
                            {user.isBlocked ? 'Mở chặn' : 'Chặn'}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="btn danger"
                          >
                            Xoá
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={page === i + 1 ? 'active' : ''}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
