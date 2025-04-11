import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (!user) {
          navigate('/login');
        } else {
          setUser(user);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-box">
          <div className="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-box">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/')} className="home-button">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h2>프로필</h2>
        <div className="profile-info">
          <div className="info-item">
            <span className="label">이메일:</span>
            <span className="value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="label">계정 생성일:</span>
            <span className="value">
              {user?.metadata.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '알 수 없음'}
            </span>
          </div>
          <div className="info-item">
            <span className="label">마지막 로그인:</span>
            <span className="value">
              {user?.metadata.lastSignInTime
                ? new Date(user.metadata.lastSignInTime).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '알 수 없음'}
            </span>
          </div>
        </div>
        <div className="profile-actions">
          <button
            onClick={() => navigate('/change-password')}
            className="change-password-button"
          >
            비밀번호 변경
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 