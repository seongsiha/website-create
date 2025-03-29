import React, { useState } from 'react';
import './Navigation.css';
import { Link } from 'react-router-dom';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="nav">
      <div className="nav-content">
        <a href="/" className="nav-logo">
          📚 웹소설리뷰
        </a>

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
        </ul>

        <div className="nav-buttons">
          <a href="/login" className="login-button">로그인</a>
          <a href="/signup" className="signup-button">회원가입</a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 