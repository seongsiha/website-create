import React, { useState } from 'react';
import './NewReviews.css';

const NewReviews = () => {
  const [activeFilter, setActiveFilter] = useState('전체');

  const filters = ['전체', '판타지', '로맨스', '무협', '라이트노벨', '현대판타지', '무협'];

  const reviews = [
    {
      id: 1,
      title: "이세계 여행사의 신입사원",
      author: "여행스토리",
      rating: 4.5,
      date: "2024.03.18",
      coverImage: "https://placehold.co/400x600/4338ca/ffffff.jpg?text=이세계+여행사",
      excerpt: "현대 직장인의 고민과 판타지 세계의 모험을 절묘하게 버무린 신작. 특히 주인공의 현실적인 성장과 업무 처리 방식이 인상적이다. 이세계물의 신선한 해석이 돋보이는 작품...",
      tags: ["판타지", "일상물", "신작"],
      views: 1234,
      likes: 567,
      comments: 89
    },
    {
      id: 2,
      title: "프로그래머의 마법공방",
      author: "코드위자드",
      rating: 4.2,
      date: "2024.03.17",
      coverImage: "https://placehold.co/400x600/3730a3/ffffff.jpg?text=마법공방",
      excerpt: "현대 기술과 마법의 만남이라는 신선한 설정이 인상적인 작품. 프로그래밍 지식을 마법으로 승화시키는 과정이 흥미진진하다...",
      tags: ["현대판타지", "기술", "신작"],
      views: 982,
      likes: 421,
      comments: 67
    }
  ];

  return (
    <div className="new-reviews-container">
      <div className="page-header">
        <h1>신작 리뷰</h1>
        <p>새롭게 등록된 웹소설 리뷰를 만나보세요</p>
      </div>

      <nav className="genre-navigation">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`genre-button ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </nav>

      <div className="reviews-grid">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-card-image">
              <img src={review.coverImage} alt={review.title} />
              <div className="review-rating-wrapper">
                <div className="review-rating">
                  <span className="star">★</span>
                  <span className="rating-number">{review.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="review-card-content">
              <div className="review-card-header">
                <h3>{review.title}</h3>
                <span className="review-date">{review.date}</span>
              </div>
              <p className="review-author">by {review.author}</p>
              <p className="review-excerpt">{review.excerpt}</p>
              <div className="review-tags">
                {review.tags.map((tag, index) => (
                  <span key={index} className="review-tag">{tag}</span>
                ))}
              </div>
              <div className="review-stats">
                <span><i className="fas fa-eye"></i> {review.views}</span>
                <span><i className="fas fa-heart"></i> {review.likes}</span>
                <span><i className="fas fa-comment"></i> {review.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewReviews; 