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
  increment,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { 
  FacebookShareButton, 
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon
} from 'react-share';
import './ReviewDetail.css';

// formatDate 함수 정의
const formatDate = (timestamp) => {
  if (!timestamp) return '날짜 없음';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  if (diff < 60 * 1000) return '방금 전';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}분 전`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}시간 전`;
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}일 전`;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = date.getHours() < 12 ? '오전' : '오후';
  const displayHours = date.getHours() % 12 || 12;
  return `${year}.${month}.${day} ${ampm} ${displayHours}:${minutes}`;
};

// renderRating 함수 정의
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

const ReviewDetail = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadReview();
    fetchComments();
  }, [reviewId]);

  useEffect(() => {
    // 관리자 권한 확인
    if (auth.currentUser?.email === 'seongsiha@naver.com') {
      setIsAdmin(true);
    }
  }, []);

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

  const fetchComments = async () => {
    try {
      const safeReviewId = String(reviewId).trim().toLowerCase();
      const commentsQuery = query(
        collection(db, 'reviewComments'),
        where('reviewId', '==', safeReviewId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(commentsQuery);
      const commentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('reviewId:', safeReviewId);
      console.log('commentsData:', commentsData);
      setComments(commentsData);
    } catch (error) {
      console.error('댓글 로드 실패:', error);
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const safeReviewId = String(reviewId).trim().toLowerCase();
      const commentData = {
        reviewId: safeReviewId,
        content: newComment,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'reviewComments'), commentData);
      await updateDoc(doc(db, 'reviews', reviewId), {
        comments: increment(1)
      });

      setNewComment('');
      await fetchComments();
      await loadReview();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAdmin && auth.currentUser?.email !== comments.find(c => c.id === commentId)?.userEmail) {
      alert('댓글을 삭제할 권한이 없습니다.');
      return;
    }

    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'reviewComments', commentId));
        
        // 댓글 수 감소
        await updateDoc(doc(db, 'reviews', reviewId), {
          comments: increment(-1)
        });

        fetchComments();
        loadReview(); // 댓글 수 업데이트를 위해 리뷰 정보 새로고침
      } catch (error) {
        console.error('댓글 삭제 실패:', error);
        alert('댓글 삭제에 실패했습니다.');
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

      <section className="comments-section">
        <h2>댓글 {comments.length}개</h2>
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 작성하세요..."
            required
          />
          <button type="submit">댓글 작성</button>
        </form>
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-author">{comment.userEmail || '익명'}</span>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="comment-content">{comment.content}</p>
              {(isAdmin || auth.currentUser?.email === comment.userEmail) && (
                <button
                  className="delete-comment"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ReviewDetail;