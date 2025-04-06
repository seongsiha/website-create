import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="nav">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          📚 웹소설리뷰
        </Link>

        <button className="nav-toggle" onClick={toggleMenu} aria-label="메뉴 열기">
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <ul className={`nav-list ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link">홈</Link>
          </li>
          <li className="nav-item">
            <Link to="/genres" className="nav-link">장르별</Link>
          </li>
          <li className="nav-item">
            <Link to="/new-reviews" className="nav-link">신작리뷰</Link>
          </li>
          <li className="nav-item">
            <Link to="/best-reviews" className="nav-link">베스트리뷰</Link>
          </li>
          <li className="nav-item">
            <Link to="/community" className="nav-link">커뮤니티</Link>
          </li>
          <li className="nav-item">
            <Link to="/write-review" className="nav-link write-review-link">리뷰 작성</Link>
          </li>
        </ul>

        <div className="nav-buttons">
          <Link to="/login" className="login-button">로그인</Link>
          <Link to="/signup" className="signup-button">회원가입</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 