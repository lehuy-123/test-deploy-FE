import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import UserBlogList from './pages/UserBlogList';
import CreateBlog from './pages/CreateBlog';
import EditBlog from './pages/EditBlog';
import BlogByTag from './pages/BlogByTag';
import BlogByCategory from './pages/BlogByCategory';
import EditUserProfile from './pages/EditUserProfile';
import BookmarkList from './pages/BookmarkList';


import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPostsDashboard from './pages/admin/AdminPostsDashboard';
import AdminPostDetail from './pages/admin/AdminPostDetail';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCommentsPage from './pages/admin/AdminCommentsPage';
import AdminTagManager from './pages/admin/AdminTagManager';



import '@fortawesome/fontawesome-free/css/all.min.css';

// ✅ Route bảo vệ cho admin
const ProtectedAdminRoute = ({ element }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'admin' ? element : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang người dùng */}
        <Route path="/" element={<Home />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-blogs" element={<UserBlogList />} />
        <Route path="/create-blog" element={<CreateBlog />} />
        <Route path="/edit-blog/:id" element={<EditBlog />} />
        <Route path="/tag/:tag" element={<BlogByTag />} />
        <Route path="/category/:category" element={<BlogByCategory />} />
        <Route path="/profile" element={<EditUserProfile />} />
        <Route path="/bookmarks" element={<BookmarkList />} />

        {/* Trang quản trị Admin */}
        <Route path="/admin" element={<ProtectedAdminRoute element={<AdminDashboard />} />} />
        <Route path="/admin/posts" element={<ProtectedAdminRoute element={<AdminPostsDashboard />} />} />
        <Route path="/admin/users" element={<ProtectedAdminRoute element={<AdminUsersPage />} />} />
       <Route path="/admin/comments" element={<AdminCommentsPage />} />
        <Route path="/admin/posts/:id" element={<AdminPostDetail />} />
        <Route path="/admin/tags" element={<AdminTagManager />} />
      </Routes>
    </Router>
  );
}

export default App;
