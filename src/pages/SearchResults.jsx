import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import './Reviews.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const queryParam = useQuery();
  const searchQuery = queryParam.get('query') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef);
      const querySnapshot = await getDocs(q);
      const allReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = allReviews.filter(review => {
        const titleMatch = review.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const contentMatch = review.content?.toLowerCase().includes(searchQuery.toLowerCase());
        const tagMatch = review.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return titleMatch || contentMatch || tagMatch;
      });
      setResults(filtered);
      setLoading(false);
    };
    if (searchQuery.trim() !== '') fetchResults();
  }, [searchQuery]);

  return (
    <div className="reviews-container">
      <h2>"{searchQuery}" 검색 결과</h2>
      {loading ? (
        <div className="loading">검색 중...</div>
      ) : results.length === 0 ? (
        <div className="error-message">검색 결과가 없습니다.</div>
      ) : (
        <div className="reviews-grid">
          {results.map((review) => (
            <article key={review.id} className="review-card" onClick={() => navigate(`/review/${review.id}`)}>
              <h3 className="review-title">{review.title}</h3>
              <div className="tags">
                {review.tags?.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
              <p className="review-preview">{review.content?.slice(0, 100)}...</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults; 