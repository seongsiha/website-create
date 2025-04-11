import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import './ChangePassword.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      // 현재 비밀번호로 재인증
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // 비밀번호 업데이트
      await updatePassword(user, newPassword);
      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      
      // 2초 후 홈으로 이동
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      if (error.code === 'auth/wrong-password') {
        setError('현재 비밀번호가 올바르지 않습니다.');
      } else if (error.code === 'auth/requires-recent-login') {
        setError('보안을 위해 다시 로그인해주세요.');
      } else {
        setError('비밀번호 변경 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-box">
        <h2>비밀번호 변경</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">현재 비밀번호</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword; 