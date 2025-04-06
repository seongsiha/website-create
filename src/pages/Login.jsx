import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, signInWithPopup, 
         GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      console.log('로그인 성공:', userCredential.user);
      navigate('/');
    } catch (error) {
      console.error('로그인 실패:', error);
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      let authProvider;
      switch (provider) {
        case 'google':
          authProvider = new GoogleAuthProvider();
          break;
        case 'facebook':
          authProvider = new FacebookAuthProvider();
          break;
        default:
          throw new Error('지원하지 않는 소셜 로그인입니다.');
      }

      const result = await signInWithPopup(auth, authProvider);
      console.log('소셜 로그인 성공:', result.user);
      navigate('/');
    } catch (error) {
      console.error('소셜 로그인 실패:', error);
      setError('소셜 로그인에 실패했습니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="logo">
        <h1>웹소설 리뷰 커뮤니티</h1>
        <p>당신의 리뷰를 기다립니다</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit">로그인</button>

        <div className="helper-links">
          <Link to="/forgot-password">비밀번호 찾기</Link> | <Link to="/signup">회원가입</Link>
        </div>

        <div className="social-login">
          <p>소셜 계정으로 로그인</p>
          <div className="social-buttons">
            <button type="button" onClick={() => handleSocialLogin('google')}>구글</button>
          </div>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Login; 