import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import './ReviewForm.css';

const ReviewForm = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  const availableTags = ['판타지', '로맨스', '무협', '라이트노벨', '일상', '성장', '힐링'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagClick = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert('리뷰를 작성하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const reviewData = {
        title: formData.title,
        content: formData.content,
        rating,
        tags: selectedTags,
        authorId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0
      };

      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      console.log('리뷰 작성 성공:', docRef.id);
      navigate('/my-reviews');
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      alert('리뷰 작성에 실패했습니다.');
    }
  };

  return (
    <div className="review-form-container">
      <div className="page-header">
        <h1>리뷰 작성</h1>
        <p>웹소설에 대한 여러분의 생각을 들려주세요</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="input-group">
            <h2>작품 제목</h2>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="작품 제목을 입력해주세요"
              required
            />
          </div>

          <div className="input-group">
            <h2>평점</h2>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`star-button ${rating >= star ? 'active' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <h2>태그 선택</h2>
            <div className="tag-buttons">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <h2>리뷰 내용</h2>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="리뷰 내용을 입력해주세요"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            리뷰 등록하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 