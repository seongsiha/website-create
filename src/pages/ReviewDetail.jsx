import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  increment
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { 
  FacebookShareButton, 
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon
} from 'react-share';
import './ReviewDetail.css';

const ReviewDetail = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    loadReview();
  }, [reviewId]);

  const loadReview = async () => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) {
        setError('리뷰를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      const reviewData = reviewDoc.data();
      setReview({ id: reviewDoc.id, ...reviewData });
      setIsAuthor(auth.currentUser && auth.currentUser.uid === reviewData.userId);
      setLikesCount(reviewData.likes || 0);

      // 좋아요 상태 확인
      if (auth.currentUser) {
        const likeQuery = query(
          collection(db, 'reviewLikes'),
          where('reviewId', '==', reviewId),
          where('userId', '==', auth.currentUser.uid)
        );
        const likeSnapshot = await getDocs(likeQuery);
        setLiked(!likeSnapshot.empty);
      }

      setLoading(false);
    } catch (error) {
      console.error('리뷰 로드 실패:', error);
      setError('리뷰를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleLike = async () => {
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
        setLiked(true);
        setLikesCount(prev => prev + 1);
      } else {
        // 좋아요 취소
        await deleteDoc(likeSnapshot.docs[0].ref);
        await updateDoc(reviewRef, {
          likes: increment(-1)
        });
        setLiked(false);
        setLikesCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
    }
  };

  const handleEdit = () => {
    navigate(`/reviews/${reviewId}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'reviews', reviewId));
        navigate('/reviews');
      } catch (error) {
        console.error('리뷰 삭제 실패:', error);
        alert('리뷰 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const shareUrl = window.location.href;
  const shareTitle = review?.title || '웹소설 리뷰';
  const shareDescription = review?.content?.substring(0, 100) || '';

  const handleKakaoShare = () => {
    if (window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: shareTitle,
          description: shareDescription,
          imageUrl: 'https://your-default-image-url.jpg', // 기본 이미지 URL로 변경하세요
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '웹으로 보기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    }
  };

  if (loading) return <div className="loading">리뷰를 불러오는 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!review) return null;

  return (
    <div className="review-detail-container">
      <article className="review-detail">
        <div className="review-header">
          <div className="review-thumbnail">
            <img src={review.thumbnail || review.images?.[0]} alt={review.title} />
          </div>
          <div className="review-header-content">
            <h1 className="review-title">{review.title}</h1>
            <div className="novel-title">작품명: <span>{review.novelTitle}</span></div>
            <div className="review-meta">
              <span className="author">{review.userEmail || '익명'}</span>
              <span className="date">{formatDate(review.createdAt)}</span>
            </div>
            <div className="rating">
              {renderRating(review.rating, review.ratingCount)}
            </div>
            <div className="tags">
              {review.tags?.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            {isAuthor && (
              <div className="review-actions">
                <button onClick={handleEdit} className="edit-button">수정</button>
                <button onClick={handleDelete} className="delete-button">삭제</button>
              </div>
            )}
          </div>
          <div className="share-buttons">
            <button onClick={handleKakaoShare} className="kakao-share-button" aria-label="카카오톡 공유하기">
              <span className="kakao-share-icon" />
            </button>
            <FacebookShareButton url={shareUrl}>
              <FacebookIcon size={40} round />
            </FacebookShareButton>
            <TwitterShareButton url={shareUrl} title={shareTitle}>
              <TwitterIcon size={40} round />
            </TwitterShareButton>
          </div>
        </div>

        <div className="review-content">
          <div className="review-text">{review.content}</div>
          {review.images && review.images.length > 1 && (
            <div className="review-images">
              {review.images.slice(1).map((imageUrl, index) => (
                <img 
                  key={index}
                  src={imageUrl} 
                  alt={`리뷰 이미지 ${index + 2}`} 
                  className="review-image" 
                />
              ))}
            </div>
          )}
          <div className="review-footer">
            <div className="review-stats">
              <span className="stat-item">👁️ {review.views || 0}</span>
              <button 
                className={`like-button ${liked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                ❤️ {likesCount}
              </button>
              <span className="stat-item">💬 {review.comments || 0}</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const renderRating = (rating, count) => {
  const ratingNum = typeof rating === 'number' ? rating : 0;
  const displayRating = Number(ratingNum).toFixed(2);
  const fullStars = '★'.repeat(Math.floor(ratingNum));
  const emptyStars = '☆'.repeat(5 - Math.floor(ratingNum));
  
  return (
    <div className="rating">
      <span className="stars">{fullStars}{emptyStars}</span>
      <span className="score">{displayRating}</span>
      {count > 0 && <span className="count">({count})</span>}
    </div>
  );
};

export default ReviewDetail; 