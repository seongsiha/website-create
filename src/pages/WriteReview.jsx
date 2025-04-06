import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import './WriteReview.css';

const WriteReview = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState({
    title: '',
    novelTitle: '',
    rating: 5,
    content: '',
    genre: '판타지',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        alert('리뷰 작성을 위해서는 로그인이 필요합니다.');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    
    // 태그 자동완성 로직
    if (value.length > 0) {
      const filteredTags = reviewData.tags.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestedTags(filteredTags);
    } else {
      setSuggestedTags([]);
    }
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !reviewData.tags.includes(trimmedTag)) {
      setReviewData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setTagInput('');
    setSuggestedTags([]);
  };

  const removeTag = (tagToRemove) => {
    setReviewData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const reviewDataToSave = {
        ...reviewData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: [],
        views: 0
      };

      // 리뷰 저장
      const docRef = await addDoc(collection(db, 'reviews'), reviewDataToSave);
      
      // 태그 통계 업데이트
      for (const tag of reviewData.tags) {
        const tagsRef = collection(db, 'tags');
        const q = query(tagsRef, where('tagName', '==', tag));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          await addDoc(tagsRef, {
            tagName: tag,
            count: 1,
            lastUsed: serverTimestamp()
          });
        } else {
          // 태그 카운트 업데이트는 나중에 구현
        }
      }

      alert('리뷰가 성공적으로 작성되었습니다!');
      navigate('/');
    } catch (error) {
      console.error('리뷰 작성 중 오류 발생:', error);
      setError('리뷰 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="write-review-container">
      <div className="write-review-header">
        <h1>리뷰 작성</h1>
        <p>작품에 대한 솔직한 리뷰를 남겨주세요</p>
      </div>

      <form onSubmit={handleSubmit} className="write-review-form">
        <div className="form-group">
          <label htmlFor="novelTitle">작품 제목</label>
          <input
            type="text"
            id="novelTitle"
            name="novelTitle"
            value={reviewData.novelTitle}
            onChange={handleInputChange}
            placeholder="리뷰할 작품의 제목을 입력하세요"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="title">리뷰 제목</label>
          <input
            type="text"
            id="title"
            name="title"
            value={reviewData.title}
            onChange={handleInputChange}
            placeholder="리뷰의 제목을 입력하세요"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="genre">장르</label>
            <select
              id="genre"
              name="genre"
              value={reviewData.genre}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            >
              <option value="판타지">판타지</option>
              <option value="로맨스">로맨스</option>
              <option value="무협">무협</option>
              <option value="미스터리">미스터리</option>
              <option value="SF">SF</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rating">평점</label>
            <select
              id="rating"
              name="rating"
              value={reviewData.rating}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            >
              {[5, 4, 3, 2, 1].map(num => (
                <option key={num} value={num}>
                  {'★'.repeat(num)}{'☆'.repeat(5-num)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="content">리뷰 내용</label>
          <textarea
            id="content"
            name="content"
            value={reviewData.content}
            onChange={handleInputChange}
            placeholder="작품에 대한 솔직한 리뷰를 작성해주세요"
            required
            rows="10"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>태그</label>
          <div className="tag-input-container">
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagKeyDown}
              placeholder="태그 입력 후 엔터 (예: 로맨스판타지, 힐링물)"
              disabled={isSubmitting}
            />
            {suggestedTags.length > 0 && (
              <div className="tag-suggestions">
                {suggestedTags.map(tag => (
                  <div 
                    key={tag} 
                    className="tag-suggestion"
                    onClick={() => addTag(tag)}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="selected-tags">
            {reviewData.tags.map(tag => (
              <span key={tag} className="tag">
                #{tag}
                <button 
                  type="button" 
                  onClick={() => removeTag(tag)}
                  disabled={isSubmitting}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '리뷰 작성 중...' : '리뷰 작성하기'}
          </button>
          <button 
            type="button" 
            className="cancel-button" 
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteReview; 