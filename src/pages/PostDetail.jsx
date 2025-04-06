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
  collection
} from '../firebase/config';
import './PostDetail.css';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const viewIncrementedRef = useRef(false);

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
        const postDoc = doc(db, 'posts', postId);
        const postSnapshot = await getDocs(query(postsCollection, where('__name__', '==', postId)));
        
        if (!postSnapshot.empty) {
          const postData = {
            id: postSnapshot.docs[0].id,
            ...postSnapshot.docs[0].data()
          };

          // 조회수 증가
          const newViews = (postData.views || 0) + 1;
          await updateDoc(postDoc, {
            views: newViews
          });
          
          // 업데이트된 조회수를 포함하여 게시글 데이터 설정
          setPost({
            ...postData,
            views: newViews
          });

          // 좋아요 상태 확인
          if (auth.currentUser) {
            const likeQuery = query(
              likesCollection,
              where('postId', '==', postId),
              where('userId', '==', auth.currentUser.uid)
            );
            const likeSnapshot = await getDocs(likeQuery);
            setIsLiked(!likeSnapshot.empty);
          }
        } else {
          navigate('/community');
        }
      } catch (error) {
        console.error('게시글 로드 실패:', error);
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
      } finally {
        setLoading(false);
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

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!post) {
    return <div className="error">게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="post-detail-container">
      <div className="post-header">
        <h1>{post.title}</h1>
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
                </span>
              </div>
              <div className="comment-content">{comment.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail; 