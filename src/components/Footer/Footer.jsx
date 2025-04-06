import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>웹소설 리뷰</h3>
          <ul>
            <li><a href="/latest">최신 리뷰</a></li>
            <li><a href="/popular">인기 리뷰</a></li>
            <li><a href="/genres">장르별 리뷰</a></li>
            <li><a href="/writers">작가별 리뷰</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>커뮤니티</h3>
          <ul>
            <li><a href="/about">소개</a></li>
            <li><a href="/guidelines">이용 가이드</a></li>
            <li><a href="/faq">자주 묻는 질문</a></li>
            <li><a href="/contact">문의하기</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>법적 고지</h3>
          <ul>
            <li><a href="/terms">이용약관</a></li>
            <li><a href="/privacy">개인정보처리방침</a></li>
            <li><a href="/copyright">저작권 정책</a></li>
          </ul>
        </div>
      </div>

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