import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);
  const [nicknameMessage, setNicknameMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'nickname') {
      setIsNicknameAvailable(false);
      setNicknameMessage('');
    }
  };

  const checkNickname = async () => {
    if (!formData.nickname) {
      setNicknameMessage('닉네임을 입력해주세요.');
      return;
    }

    try {
      // Firestore에서 닉네임 중복 체크
      const nicknameDoc = doc(db, 'nicknames', formData.nickname);
      const nicknameSnapshot = await getDoc(nicknameDoc);
      
      const isAvailable = !nicknameSnapshot.exists();
      setIsNicknameAvailable(isAvailable);
      setNicknameMessage(
        isAvailable 
          ? '✓ 사용 가능한 닉네임입니다.' 
          : '✕ 이미 사용 중인 닉네임입니다.'
      );
    } catch (error) {
      console.error('닉네임 확인 오류:', error);
      setNicknameMessage('닉네임 확인 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isNicknameAvailable) {
      alert('닉네임 중복 확인을 해주세요.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // Firebase Authentication으로 사용자 생성
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Firestore에 사용자 정보 저장
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        nickname: formData.nickname,
        email: formData.email,
        createdAt: new Date().toISOString()
      });

      // 닉네임 예약
      await setDoc(doc(db, 'nicknames', formData.nickname), {
        uid: userCredential.user.uid
      });

      console.log('회원가입 성공');
      navigate('/login');
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입에 실패했습니다: ' + error.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="logo">
        <h1>웹소설 리뷰 커뮤니티</h1>
        <p>나만의 리뷰로 작품을 빛내보세요</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nickname">닉네임</label>
          <div className="nickname-group">
            <div className="nickname-input-wrapper">
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder="2자 이상의 닉네임을 입력하세요"
                required
                minLength="2"
              />
            </div>
            <button 
              type="button" 
              className={`check-button ${formData.nickname.length < 2 ? 'disabled' : ''}`}
              onClick={checkNickname}
              disabled={formData.nickname.length < 2}
            >
              중복 확인
            </button>
          </div>
          {nicknameMessage && (
            <div className={`check-result ${isNicknameAvailable ? 'available' : 'unavailable'}`}>
              {nicknameMessage}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="example@email.com"
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
            placeholder="8자 이상의 비밀번호를 입력하세요"
            required
            minLength="8"
          />
        </div>

        <div className="form-group">
          <label htmlFor="passwordConfirm">비밀번호 확인</label>
          <input
            type="password"
            id="passwordConfirm"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleInputChange}
            placeholder="비밀번호를 한 번 더 입력하세요"
            required
          />
        </div>

        <button type="submit" className="submit-button">
          회원가입 완료
        </button>

        <div className="helper-links">
          <p>
            이미 계정이 있으신가요?
            <Link to="/login">로그인하기</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup; 