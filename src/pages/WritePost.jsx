import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsCollection, auth } from '../firebase/config';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import './WritePost.css';

const WritePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('자유게시판');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const postData = {
        title: title.trim(),
        content: content.trim(),
        category,
        author: auth.currentUser.email,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        views: 0,
        likes: 0,
        commentCount: 0
      };

      await addDoc(postsCollection, postData);
      alert('게시글이 작성되었습니다.');
      navigate('/community');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="write-post-container">
      <h1>글쓰기</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>게시판</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="자유게시판">자유게시판</option>
            <option value="질문게시판">질문게시판</option>
            <option value="추천게시판">추천게시판</option>
          </select>
        </div>

        <div className="form-group">
          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={10}
          />
        </div>

        <div className="button-group">
          <button
            type="button"
            onClick={() => navigate('/community')}
            className="cancel-button"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? '작성 중...' : '작성하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WritePost; 