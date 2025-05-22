import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  increment,
  where,
  getDoc,
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('최신리뷰');
  const [likedReviews, setLikedReviews] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const viewIncrementedRef = useRef({});

  useEffect(() => {
    // 관리자 권한 확인
    if (auth.currentUser?.email === 'seongsiha@naver.com') {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReviews(reviews);
      setIsSearching(false);
    } else {
      setIsSearching(true);
      const filtered = reviews.filter(review => {
        const titleMatch = review.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const contentMatch = review.content?.toLowerCase().includes(searchQuery.toLowerCase());
        const tagMatch = review.tags?.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return titleMatch || contentMatch || tagMatch;
      });
      setFilteredReviews(filtered);
    }
  }, [searchQuery, reviews]);

  useEffect(() => {
    fetchReviews();
    if (auth.currentUser) {
      fetchLikedReviews();
    }
  }, [activeTab]);

  useEffect(() => {
    let sorted = [...reviews];
    if (activeTab === '최신리뷰') {
      sorted.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.seconds - a.createdAt.seconds;
      });
    } else if (activeTab === '조회수순(인기리뷰)') {
      sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (activeTab === '좋아요순') {
      sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    setFilteredReviews(sorted);
  }, [activeTab, reviews]);

  const fetchLikedReviews = async () => {
    try {
      const likesQuery = query(
        collection(db, 'reviewLikes'),
        where('userId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(likesQuery);
      const likedReviewsData = {};
      querySnapshot.forEach(doc => {
        likedReviewsData[doc.data().reviewId] = true;
      });
      setLikedReviews(likedReviewsData);
    } catch (error) {
      console.error('좋아요 상태 로드 실패:', error);
    }
  };

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
      setFilteredReviews(reviewsData);
      setLoading(false);
    } catch (error) {
      console.error('리뷰를 불러오는 중 오류가 발생했습니다:', error);
      setLoading(false);
    }
  };

  const handleReviewClick = async (reviewId) => {
    if (!viewIncrementedRef.current[reviewId]) {
      try {
        const reviewRef = doc(db, 'reviews', reviewId);
        await updateDoc(reviewRef, {
          views: increment(1)
        });
        viewIncrementedRef.current[reviewId] = true;
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === reviewId 
              ? { ...review, views: (review.views || 0) + 1 }
              : review
          )
        );
      } catch (error) {
        console.error('조회수 증가 실패:', error);
      }
    }
    navigate(`/reviews/${reviewId}`);
  };

  const handleLike = async (reviewId) => {
    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      const likeQuery = query(
        collection(db, 'reviewLikes'),
        where('reviewId', '==', reviewId),
        where('userId', '==', auth.currentUser.uid)
      );
      const likeSnapshot = await getDocs(likeQuery);

      if (likeSnapshot.empty) {
        // 좋아요 추가
        await addDoc(collection(db, 'reviewLikes'), {
          reviewId,
          userId: auth.currentUser.uid,
          createdAt: new Date()
        });
        await updateDoc(reviewRef, {
          likes: increment(1)
        });
        setLikedReviews(prev => ({ ...prev, [reviewId]: true }));
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === reviewId 
              ? { ...review, likes: (review.likes || 0) + 1 }
              : review
          )
        );
      } else {
        // 좋아요 취소
        await deleteDoc(likeSnapshot.docs[0].ref);
        await updateDoc(reviewRef, {
          likes: increment(-1)
        });
        setLikedReviews(prev => ({ ...prev, [reviewId]: false }));
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === reviewId 
              ? { ...review, likes: (review.likes || 0) - 1 }
              : review
          )
        );
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '날짜 없음';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 1분 미만
    if (diff < 60 * 1000) {
      return '방금 전';
    }
    // 1시간 미만
    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}분 전`;
    }
    // 24시간 미만
    if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}시간 전`;
    }
    // 7일 미만
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (24 * 60 * 60 * 1000))}일 전`;
    }
    
    // 7일 이상 지난 경우
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = date.getHours() < 12 ? '오전' : '오후';
    const displayHours = date.getHours() % 12 || 12; // 12시간제로 변환
    
    return `${year}.${month}.${day} ${ampm} ${displayHours}:${minutes}`;
  };

  const handleTabClick = (e, tab) => {
    e.preventDefault();
    setActiveTab(tab);
    setLoading(true);
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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteReview = async (reviewId, e) => {
    e.stopPropagation(); // 리뷰 클릭 이벤트 전파 방지
    
    if (!isAdmin) {
      alert('관리자만 삭제할 수 있습니다.');
      return;
    }

    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'reviews', reviewId));
        setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
        setFilteredReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
        alert('리뷰가 삭제되었습니다.');
      } catch (error) {
        console.error('리뷰 삭제 실패:', error);
        alert('리뷰 삭제에 실패했습니다.');
      }
    }
  };

  const handleBlockUser = async (userId, userEmail, e) => {
    e.stopPropagation(); // 리뷰 클릭 이벤트 전파 방지
    
    if (!isAdmin) {
      alert('관리자만 차단할 수 있습니다.');
      return;
    }

    if (window.confirm(`${userEmail} 사용자를 차단하시겠습니까?`)) {
      try {
        // 차단된 사용자 목록에 추가
        await addDoc(collection(db, 'blockedUsers'), {
          userId,
          userEmail,
          blockedAt: serverTimestamp(),
          blockedBy: auth.currentUser.email
        });
        
        // 해당 사용자의 모든 리뷰 삭제
        const userReviews = reviews.filter(review => review.userId === userId);
        for (const review of userReviews) {
          await deleteDoc(doc(db, 'reviews', review.id));
        }
        
        // 화면에서 해당 사용자의 리뷰 제거
        setReviews(prevReviews => prevReviews.filter(review => review.userId !== userId));
        setFilteredReviews(prevReviews => prevReviews.filter(review => review.userId !== userId));
        
        alert('사용자가 차단되었습니다.');
      } catch (error) {
        console.error('사용자 차단 실패:', error);
        alert('사용자 차단에 실패했습니다.');
      }
    }
  };

  if (loading) return <div className="loading">리뷰를 불러오는 중...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="reviews-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="제목, 내용, 태그로 검색..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {isSearching && (
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
      )}

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
          className={activeTab === '조회수순(인기리뷰)' ? 'active' : ''} 
          onClick={(e) => handleTabClick(e, '조회수순(인기리뷰)')}
        >
          조회수순(인기리뷰)
        </a>
        <a 
          href="#" 
          className={activeTab === '좋아요순' ? 'active' : ''} 
          onClick={(e) => handleTabClick(e, '좋아요순')}
        >
          좋아요순
        </a>
      </nav>

      <div className="reviews-grid">
        {filteredReviews.map((review, index) => (
          <article 
            key={review.id} 
            className="review-card"
            onClick={() => handleReviewClick(review.id)}
          >
            {activeTab !== '최신리뷰' && (
              <div className="rank-badge">
                {index + 1}위
              </div>
            )}
            {renderThumbnail(review)}
            <div className="review-content">
              <h3 className="review-title">{review.title}</h3>
              <div className="novel-title">작품명: <span>{review.novelTitle}</span></div>
              {renderRating(review.rating, review.ratingCount)}
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
                  <button 
                    className={`like-button ${likedReviews[review.id] ? 'liked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(review.id);
                    }}
                  >
                    ❤️ {review.likes || 0}
                  </button>
                  <span className="stat-item">💬 {review.comments || 0}</span>
                </div>
                {isAdmin && (
                  <div className="admin-actions">
                    <button 
                      className="admin-button delete"
                      onClick={(e) => handleDeleteReview(review.id, e)}
                    >
                      <i className="fas fa-trash"></i> 삭제
                    </button>
                    <button 
                      className="admin-button block"
                      onClick={(e) => handleBlockUser(review.userId, review.userEmail, e)}
                    >
                      <i className="fas fa-ban"></i> 차단
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Reviews; 