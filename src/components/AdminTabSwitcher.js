import React from 'react';
import '../styles/AdminTabSwitcher.css';

const AdminTabSwitcher = ({ currentTab, onTabChange, tabs }) => {
  return (
    <div className="admin-tab-switcher">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`admin-tab-btn${currentTab === tab.key ? ' active' : ''}`}
          onClick={() => onTabChange(tab.key)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AdminTabSwitcher;