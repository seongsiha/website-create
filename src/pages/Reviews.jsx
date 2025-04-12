import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('최신리뷰');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('리뷰를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} 오후`;
  };

  const handleTabClick = (e, tab) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  const renderRating = (rating, count) => {
    const ratingNum = typeof rating === 'number' ? rating : 0;
    const displayRating = Number(ratingNum).toFixed(2);
    const fullStars = '★'.repeat(Math.floor(ratingNum));
    const emptyStars = '☆'.repeat(5 - Math.floor(ratingNum));
    
    return (
      <div className="review-rating">
        <span className="review-stars">{fullStars}{emptyStars}</span>
        <span className="review-score">{displayRating}</span>
        {count > 0 && <span className="review-count">({count})</span>}
      </div>
    );
  };

  const renderThumbnail = (review) => {
    // 리뷰에 이미지 배열이 있고, 첫 번째 이미지가 있는 경우
    if (review.images && review.images.length > 0) {
      return (
        <div className="review-thumbnail">
          <img src={review.images[0]} alt={review.title} />
        </div>
      );
    }
    
    // 리뷰에 단일 이미지가 있는 경우
    if (review.image) {
      return (
        <div className="review-thumbnail">
          <img src={review.image} alt={review.title} />
        </div>
      );
    }

    // 리뷰에 coverImage가 있는 경우
    if (review.coverImage) {
      return (
        <div className="review-thumbnail">
          <img src={review.coverImage} alt={review.title} />
        </div>
      );
    }

    // 이미지가 없는 경우 기본 이미지 표시
    return (
      <div className="review-thumbnail">
        <img src="/default-cover.jpg" alt="기본 이미지" />
      </div>
    );
  };

  if (loading) return <div className="loading">리뷰를 불러오는 중...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="reviews-container">
      <nav className="reviews-nav">
        <a 
          href="#" 
          className={activeTab === '최신리뷰' ? 'active' : ''} 
          onClick={(e) => handleTabClick(e, '최신리뷰')}
        >
          최신리뷰
        </a>
        <a 
          href="#" 
          className={activeTab === '인기리뷰' ? 'active' : ''} 
          onClick={(e) => handleTabClick(e, '인기리뷰')}
        >
          인기 리뷰
        </a>
        <a 
          href="#" 
          className={activeTab === '장르별리뷰' ? 'active' : ''} 
          onClick={(e) => handleTabClick(e, '장르별리뷰')}
        >
          장르별 리뷰
        </a>
      </nav>

      <div className="reviews-grid">
        {reviews.map((review) => {
          const {
            id,
            title = '',
            content = '',
            rating = 0,
            ratingCount = 0,
            userEmail = '익명',
            category = '판타지, 현대판타지',
            createdAt,
            likes = 0,
            dislikes = 0
          } = review;

          return (
            <div key={id} className="review-card">
              {renderThumbnail(review)}
              <div className="review-content">
                <div className="review-header">
                  <div className="review-category">{category}</div>
                  <h2 className="review-title">{title}</h2>
                  {renderRating(rating, ratingCount)}
                </div>
                <p className="review-text">{content}</p>
                <div className="review-meta">
                  <span>{userEmail}</span>
                  <span>{formatDate(createdAt)}</span>
                </div>
                <div className="review-actions">
                  <button className="review-action">
                    공감 {likes}
                  </button>
                  <button className="review-action">
                    비공감 {dislikes}
                  </button>
                  <button className="review-action">
                    신고
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reviews; 