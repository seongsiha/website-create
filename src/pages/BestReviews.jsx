import React, { useState } from 'react';
import './BestReviews.css';

const BestReviews = () => {
  const [activePeriod, setActivePeriod] = useState('weekly');

  const reviews = [
    {
      id: 1,
      rank: 1,
      title: "전생했더니 개발자였던 건에 대하여",
      author: "코드마스터",
      rating: 4.8,
      views: 15234,
      likes: 2891,
      comments: 458,
      excerpt: "현실적인 전개와 깊이 있는 스토리가 인상적인 작품. 특히 주인공의 성장 과정이 공감되며...",
      tags: ["판타지", "성장", "전생"],
      coverImage: "https://placehold.co/400x600/7c3aed/ffffff.jpg?text=개발자+전생기",
      publishedDate: "2024.03.15"
    },
    // ... 더 많은 리뷰 데이터
  ];

  return (
    <div className="best-reviews-container">
      <div className="page-header">
        <h1>베스트 리뷰</h1>
        <p>독자들이 선택한 최고의 리뷰를 만나보세요</p>
      </div>

      <div className="period-selector">
        <button 
          className={`period-button ${activePeriod === 'daily' ? 'active' : ''}`}
          onClick={() => setActivePeriod('daily')}
        >
          일간
        </button>
        <button 
          className={`period-button ${activePeriod === 'weekly' ? 'active' : ''}`}
          onClick={() => setActivePeriod('weekly')}
        >
          주간
        </button>
        <button 
          className={`period-button ${activePeriod === 'monthly' ? 'active' : ''}`}
          onClick={() => setActivePeriod('monthly')}
        >
          월간
        </button>
      </div>

      <div className="reviews-grid">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-rank">
              <span className={`rank-number rank-${review.rank}`}>
                {review.rank}
              </span>
            </div>
            <div className="review-cover">
              <img src={review.coverImage} alt={review.title} />
              <div className="review-rating">★ {review.rating.toFixed(1)}</div>
            </div>
            <div className="review-content">
              <h2 className="review-title">{review.title}</h2>
              <p className="review-author">by {review.author}</p>
              <p className="review-excerpt">{review.excerpt}</p>
              <div className="review-tags">
                {review.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
              <div className="review-stats">
                <span className="stat">
                  <i className="far fa-eye"></i> {review.views.toLocaleString()}
                </span>
                <span className="stat">
                  <i className="far fa-heart"></i> {review.likes.toLocaleString()}
                </span>
                <span className="stat">
                  <i className="far fa-comment"></i> {review.comments.toLocaleString()}
                </span>
              </div>
              <div className="review-date">{review.publishedDate}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestReviews; 