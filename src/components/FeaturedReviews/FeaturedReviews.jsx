import React from 'react';
import './FeaturedReviews.css';

const ReviewCard = ({ review }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).format(date);
  };

  return (
    <div className="review-card" onClick={() => window.location.href = review.link}>
      <div className="review-image-container">
        <img src={review.image} alt={`${review.title} 표지`} className="review-image" />
      </div>
      <div className="review-content">
        <h3 className="review-title">{review.title}</h3>
        <div className="rating">
          {review.rating}
          <span>({review.ratingCount}개의 평가)</span>
        </div>
        <div className="review-meta">
          <div className="review-author">
            <div className="author-avatar" />
            <span>{review.author}</span>
          </div>
          <span>{formatDate(review.date)}</span>
        </div>
        <div className="tags">
          {review.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        <p className="review-preview">{review.preview}</p>
        <div className="review-footer">
          <div className="review-stats">
            <span className="stat-item">👁️ {review.views}</span>
            <span className="stat-item">💬 {review.comments}</span>
            <span className="stat-item">❤️ {review.likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedReviews = () => {
  const reviews = [
    {
      title: '전생했더니 개발자였던 건에 대하여',
      rating: '★★★★☆',
      ratingCount: 128,
      author: '김리뷰',
      date: '2024-03-15',
      tags: ['판타지', '전생', '개발물'],
      preview: '현실적인 설정과 탄탄한 스토리 전개가 돋보이는 작품. 주인공의 성장과 함께 펼쳐지는 개발 세계관이 특히 인상적입니다. 현업 개발자들의 공감을 불러일으키는 에피소드도 흥미롭습니다.',
      image: 'https://placehold.co/400x600/7c3aed/ffffff.jpg?text=개발자+전생기',
      link: '/review1',
      views: '1.2k',
      comments: 45,
      likes: 234
    },
    {
      title: '마법사의 리팩토링',
      rating: '★★★★★',
      ratingCount: 256,
      author: '이매직',
      date: '2024-03-14',
      tags: ['판타지', '성장', '마법'],
      preview: '낡은 마법 시스템을 현대화하는 과정을 그린 신선한 작품. 마법사들의 협업과 문제 해결 과정이 현실감 있게 그려져 있으며, 흥미진진한 전개가 돋보입니다.',
      image: 'https://placehold.co/400x600/4338ca/ffffff.jpg?text=마법사의+리팩토링',
      link: '/review2',
      views: '2.3k',
      comments: 67,
      likes: 445
    },
    {
      title: '이세계 스타트업',
      rating: '★★★★☆',
      ratingCount: 189,
      author: '박창업',
      date: '2024-03-13',
      tags: ['판타지', '창업', '경영'],
      preview: '이세계에서 스타트업을 창업하는 주인공의 이야기. 현대의 비즈니스 모델을 판타지 세계에 접목시키는 참신한 시도가 인상적입니다.',
      image: 'https://placehold.co/400x600/3730a3/ffffff.jpg?text=이세계+스타트업',
      link: '/review3',
      views: '1.8k',
      comments: 56,
      likes: 323
    }
  ];

  return (
    <section className="featured-reviews">
      <h2>추천 리뷰</h2>
      <div className="review-grid">
        {reviews.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedReviews; 