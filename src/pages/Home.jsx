import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPopularReviews();
  }, []);

  const fetchPopularReviews = async () => {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef);
      const querySnapshot = await getDocs(q);
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // 조회수+좋아요 합산 기준 내림차순 정렬
      const sorted = reviews.sort((a, b) => {
        const aScore = (a.views || 0) + (a.likes || 0);
        const bScore = (b.views || 0) + (b.likes || 0);
        return bScore - aScore;
      });
      setPopularReviews(sorted.slice(0, 3));
      setFilteredReviews(sorted.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching popular reviews:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReviews(popularReviews);
      setIsSearching(false);
    } else {
      setIsSearching(true);
      const filtered = popularReviews.filter(review => {
        const titleMatch = review.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const contentMatch = review.content?.toLowerCase().includes(searchQuery.toLowerCase());
        const tagMatch = review.tags?.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return titleMatch || contentMatch || tagMatch;
      });
      setFilteredReviews(filtered);
    }
  }, [searchQuery, popularReviews]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleReviewClick = (reviewId) => {
    navigate(`/review/${reviewId}`);
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <>
      <Hero />
      <ChartSection />
      <section className="featured-reviews main-page-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="제목, 내용, 태그로 검색..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <h2>인기 리뷰</h2>
        {isSearching ? (
          <div className="search-results-container">
            <div className="search-results-header">
              <h3>검색 결과</h3>
              <span className="search-results-count">"{searchQuery}" 검색 결과: {filteredReviews.length}개</span>
            </div>
            <div className="search-results-list">
              {filteredReviews.map((review) => (
                <div 
                  key={review.id} 
                  className="search-result-item"
                  onClick={() => handleReviewClick(review.id)}
                >
                  <div className="search-result-title">{review.title}</div>
                  <div className="search-result-content">
                    {review.content?.substring(0, 100)}...
                  </div>
                  <div className="search-result-tags">
                    {review.tags?.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
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