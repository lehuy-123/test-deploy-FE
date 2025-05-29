import React, { useState } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import AdminTabSwitcher from '../../components/AdminTabSwitcher';
import ApprovedPostTable from './ApprovedPostTable';
import PendingPostTable from './PendingPostTable';
import RejectedPostTable from './RejectedPostTable';
import '../../styles/AdminPostsDashboard.css';

const AdminPostsDashboard = () => {
  const [tab, setTab] = useState('pending');

  const renderTabContent = () => {
    console.log("📌 Tab hiện tại:", tab);
    switch (tab) {
      case 'approved':
        return <ApprovedPostTable />;
      case 'pending':
        return <PendingPostTable />;
      case 'rejected':
        return <RejectedPostTable />;
      default:
        return <p className="error-text">❌ Không tìm thấy tab phù hợp (tab = {tab}).</p>;
    }
  };

  return (
    <div className="admin-container">
      <SidebarAdmin />
      <div className="admin-content">
        <h1 className="dashboard-title">📚 Quản lý bài viết</h1>

        <AdminTabSwitcher
          currentTab={tab}
          onTabChange={(newTab) => {
            console.log("🔄 Tab được chọn:", newTab);
            setTab(newTab);
          }}
          tabs={[
            { key: 'approved', label: '✅ Đã duyệt' },
            { key: 'pending', label: '⏳ Chờ duyệt' },
            { key: 'rejected', label: '❌ Từ chối' }
          ]}
        />

        <div className="tab-content">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default AdminPostsDashboard;