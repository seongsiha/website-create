import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  postsCollection, 
  commentsCollection,
  likesCollection,
  auth,
  db,
  where,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  getDoc
} from '../firebase/config';
import { 
  FacebookShareButton, 
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon
} from 'react-share';
import './PostDetail.css';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const viewIncrementedRef = useRef(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [error, setError] = useState(null);

  // 날짜 포맷 함수
  const formatDate = (timestamp) => {
    if (!timestamp) return '날짜 없음';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  // 게시글 데이터 로드
  useEffect(() => {
    const loadPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          setPost(postData);
          setIsAuthor(
            (postData.userId && postData.userId === auth.currentUser?.uid) ||
            (postData.author === auth.currentUser?.email)
          );
          
          if (!viewIncrementedRef.current) {
            await updateDoc(doc(db, 'posts', postId), {
              viewCount: increment(1),
            });
            viewIncrementedRef.current = true;
          }
        } else {
          navigate('/community');
        }
      } catch (err) {
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, navigate]);

  // 댓글 로드
  useEffect(() => {
    const loadComments = async () => {
      try {
        const q = query(
          commentsCollection,
          where('postId', '==', postId)
        );
        const querySnapshot = await getDocs(q);
        const commentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setComments(commentsData);
      } catch (error) {
        console.error('댓글 로드 실패:', error);
      }
    };

    loadComments();
  }, [postId]);

  // 좋아요 토글
  const toggleLike = async () => {
    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const postDoc = doc(db, 'posts', postId);
      const likeQuery = query(
        likesCollection,
        where('postId', '==', postId),
        where('userId', '==', auth.currentUser.uid)
      );
      const likeSnapshot = await getDocs(likeQuery);

      if (likeSnapshot.empty) {
        // 좋아요 추가
        await addDoc(likesCollection, {
          postId,
          userId: auth.currentUser.uid,
          createdAt: serverTimestamp()
        });
        await updateDoc(postDoc, {
          likes: increment(1)
        });
        setIsLiked(true);
        setPost(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
      } else {
        // 좋아요 취소
        await deleteDoc(likeSnapshot.docs[0].ref);
        await updateDoc(postDoc, {
          likes: increment(-1)
        });
        setIsLiked(false);
        setPost(prev => ({ ...prev, likes: (prev.likes || 0) - 1 }));
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const commentData = {
        postId,
        content: newComment.trim(),
        author: auth.currentUser.email,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(commentsCollection, commentData);
      const newCommentWithId = {
        id: docRef.id,
        ...commentData,
        createdAt: new Date() // 임시로 현재 시간을 표시
      };

      setComments(prev => [...prev, newCommentWithId]);
      setNewComment('');

      // 게시글의 댓글 수 증가
      const postDoc = doc(db, 'posts', postId);
      await updateDoc(postDoc, {
        commentCount: increment(1)
      });
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
        navigate('/community');
      } catch (err) {
        setError('게시글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'comments', commentId));
        setComments(comments.filter(comment => comment.id !== commentId));
        await updateDoc(doc(db, 'posts', postId), {
          commentCount: increment(-1),
        });
      } catch (err) {
        setError('댓글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      if (!editCommentContent.trim()) {
        alert('댓글 내용을 입력해주세요.');
        return;
      }

      await updateDoc(doc(db, 'comments', commentId), {
        content: editCommentContent.trim(),
        updatedAt: serverTimestamp()
      });

      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: editCommentContent.trim() }
          : comment
      ));
      setEditingComment(null);
      setEditCommentContent('');
    } catch (err) {
      setError('댓글 수정 중 오류가 발생했습니다.');
    }
  };

  const startEditingComment = (comment) => {
    setEditingComment(comment.id);
    setEditCommentContent(comment.content);
  };

  const cancelEditingComment = () => {
    setEditingComment(null);
    setEditCommentContent('');
  };

  const shareUrl = window.location.href;
  const shareTitle = post?.title || '웹소설 리뷰';
  const shareDescription = post?.content?.substring(0, 100) || '';

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

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!post) {
    return <div className="error">게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="post-detail-container">
      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="post-header">
            <h1>{post.title}</h1>
            {isAuthor && (
              <div className="post-actions">
                <button onClick={() => navigate(`/community/post/${postId}/edit`)} className="edit-button">
                  수정
                </button>
                <button onClick={handleDeletePost} className="delete-button">
                  삭제
                </button>
              </div>
            )}
            <div className="post-meta">
              <span className="author">{post.author}</span>
              <span className="date">
                {formatDate(post.createdAt)}
              </span>
            </div>
            <div className="post-stats">
              <span><i className="fas fa-eye"></i> {post.views || 0}</span>
              <button 
                className={`like-button ${isLiked ? 'liked' : ''}`}
                onClick={toggleLike}
              >
                <i className="fas fa-heart"></i> {post.likes || 0}
              </button>
              <span><i className="fas fa-comment"></i> {comments.length}</span>
            </div>
            <div className="share-buttons">
              <button onClick={handleKakaoShare} className="kakao-share-button" aria-label="카카오톡 공유하기" />
              <FacebookShareButton url={shareUrl}>
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <TwitterShareButton url={shareUrl} title={shareTitle}>
                <TwitterIcon size={32} round />
              </TwitterShareButton>
            </div>
          </div>

          <div className="post-content">
            {post.content}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
          )}

          <div className="comments-section">
            <h2>댓글 {comments.length}개</h2>
            
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 작성하세요"
                rows={3}
              />
              <button type="submit">댓글 작성</button>
            </form>

            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author}</span>
                    <span className="comment-date">
                      {formatDate(comment.createdAt)}
                      {comment.updatedAt && ' (수정됨)'}
                    </span>
                    {comment.author === auth.currentUser?.email && (
                      <div className="comment-actions">
                        {editingComment === comment.id ? (
                          <>
                            <button onClick={() => handleEditComment(comment.id)} className="save-button">
                              저장
                            </button>
                            <button onClick={cancelEditingComment} className="cancel-button">
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditingComment(comment)} className="edit-button">
                              수정
                            </button>
                            <button onClick={() => handleDeleteComment(comment.id)} className="delete-button">
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="comment-content">
                    {editingComment === comment.id ? (
                      <textarea
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                        className="edit-comment-textarea"
                        rows={3}
                      />
                    ) : (
                      comment.content
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PostDetail; 