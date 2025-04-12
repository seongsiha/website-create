import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Hero from '../components/Hero/Hero';
import ChartSection from '../components/ChartSection/ChartSection';
import './Home.css';

const ReviewCard = ({ review }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).format(date);
  };

  return (
    <div className="review-card">
      <div className="review-image-container">
        <img 
          src={review.images?.[0] || review.image || review.coverImage || 'https://placehold.co/400x600/7c3aed/ffffff.jpg?text=웹소설+리뷰'} 
          alt={`${review.title} 표지`} 
          className="review-image" 
        />
      </div>
      <div className="review-content">
        <h3 className="review-title">{review.title}</h3>
        <div className="rating">
          {'★'.repeat(Math.floor(review.rating || 0))}{'☆'.repeat(5 - Math.floor(review.rating || 0))}
          <span>({review.ratingCount || 0}개의 평가)</span>
        </div>
        <div className="review-meta">
          <div className="review-author">
            <span>{review.userEmail || '익명'}</span>
          </div>
          <span>{formatDate(review.createdAt)}</span>
        </div>
        <div className="tags">
          {review.tags?.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        <p className="review-preview">{review.content}</p>
        <div className="review-footer">
          <div className="review-stats">
            <span className="stat-item">👁️ {review.views || 0}</span>
            <span className="stat-item">💬 {review.comments || 0}</span>
            <span className="stat-item">❤️ {review.likes || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [popularReviews, setPopularReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularReviews = async () => {
      try {
        const reviewsRef = collection(db, 'reviews');
        // 조회수 기준으로 상위 3개 리뷰를 가져옵니다
        const q = query(
          reviewsRef,
          orderBy('views', 'desc'),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const reviews = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPopularReviews(reviews);
      } catch (error) {
        console.error('Error fetching popular reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularReviews();
  }, []);

  return (
    <>
      <Hero />
      <ChartSection />
      <section className="featured-reviews">
        <h2>인기 리뷰</h2>
        {loading ? (
          <div className="loading">리뷰를 불러오는 중...</div>
        ) : (
          <div className="review-grid">
            {popularReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Home; 