import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer-vnexpress">
      <div className="footer-content">
        <p>
          © {new Date().getFullYear()} Blog App. Giấy phép số: 1234/GP-TTĐT. <br />
          Chịu trách nhiệm nội dung: Lê Huy. Liên hệ: huy01082004@gmail.com | ĐT: 0948 73 73 66
        </p>
      </div>
    </footer>
  );
};

export default Footer;
