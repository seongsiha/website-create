import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-bottom">
        <div className="social-links">
          <a href="https://twitter.com" aria-label="Twitter">𝕏</a>
          <a href="https://instagram.com" aria-label="Instagram">📸</a>
          <a href="https://facebook.com" aria-label="Facebook">👥</a>
        </div>
        <p>© 2024 웹소설 리뷰 커뮤니티. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 