import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import './Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
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
          {user && (
            <li className="nav-item">
              <Link to="/write-review" className="nav-link write-review-link">리뷰 작성</Link>
            </li>
          )}
        </ul>

        <div className="nav-buttons">
          {user ? (
            <div className="user-section">
              <span className="user-email">{user.email}</span>
              <button onClick={handleLogout} className="logout-button">로그아웃</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">로그인</Link>
              <Link to="/signup" className="signup-button">회원가입</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 