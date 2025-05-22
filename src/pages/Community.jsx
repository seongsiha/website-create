import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postsCollection, query, orderBy, getDocs, where, deleteDoc, doc, addDoc, collection, serverTimestamp } from '../firebase/config';
import { limit } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import './Community.css';

const Community = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBoard, setActiveBoard] = useState('전체');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 관리자 권한 확인
    if (auth.currentUser?.email === 'seongsiha@naver.com') {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 일반 게시글 가져오기
        const q = query(postsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(postsData);
        setFilteredPosts(postsData);

        // 인기 게시글 가져오기 (좋아요 + 조회수 + 댓글수 기준)
        const trendingQuery = query(
          postsCollection,
          orderBy('likes', 'desc'),
          limit(5)
        );
        const trendingSnapshot = await getDocs(trendingQuery);
        const trendingData = trendingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrendingPosts(trendingData);
      } catch (error) {
        console.error('게시글 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 게시판 필터링
  useEffect(() => {
    if (activeBoard === '전체') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => post.category === activeBoard);
      setFilteredPosts(filtered);
    }
  }, [activeBoard, posts]);

  const handleBoardChange = (board) => {
    setActiveBoard(board);
  };

  const handleDeletePost = async (postId, e) => {
    e.stopPropagation(); // 게시글 클릭 이벤트 전파 방지
    
    if (!isAdmin) {
      alert('관리자만 삭제할 수 있습니다.');
      return;
    }

    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(postsCollection, postId));
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        setFilteredPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        alert('게시글이 삭제되었습니다.');
      } catch (error) {
        console.error('게시글 삭제 실패:', error);
        alert('게시글 삭제에 실패했습니다.');
      }
    }
  };

  const handleBlockUser = async (userId, userEmail, e) => {
    e.stopPropagation(); // 게시글 클릭 이벤트 전파 방지
    
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
        
        // 해당 사용자의 모든 게시글 삭제
        const userPosts = posts.filter(post => post.userId === userId);
        for (const post of userPosts) {
          await deleteDoc(doc(postsCollection, post.id));
        }
        
        // 화면에서 해당 사용자의 게시글 제거
        setPosts(prevPosts => prevPosts.filter(post => post.userId !== userId));
        setFilteredPosts(prevPosts => prevPosts.filter(post => post.userId !== userId));
        
        alert('사용자가 차단되었습니다.');
      } catch (error) {
        console.error('사용자 차단 실패:', error);
        alert('사용자 차단에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="community-container">
      <div className="page-header">
        <h1>커뮤니티</h1>
        <p>웹소설 독자들과 자유롭게 소통하세요</p>
      </div>

      <div className="trending-section">
        <div className="trending-header">
          <h2>
            <i className="fas fa-fire"></i>
            인기 게시글
          </h2>
          <span className="trending-update">실시간 업데이트</span>
        </div>
        <div className="trending-posts">
          {trendingPosts.map((post, index) => (
            <div 
              key={post.id} 
              className="trending-post-card"
              onClick={() => navigate(`/community/post/${post.id}`)}
            >
              <div className="trending-post-rank">{index + 1}</div>
              <div className="trending-post-content">
                <h3 className="trending-post-title">{post.title}</h3>
                <div className="trending-post-meta">
                  <span className="trending-post-author">{post.author}</span>
                  <div className="trending-post-stats">
                    <span><i className="fas fa-heart"></i> {post.likes || 0}</span>
                    <span><i className="fas fa-eye"></i> {post.views || 0}</span>
                    <span><i className="fas fa-comment"></i> {post.commentCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <nav className="community-navigation">
        <button 
          className={`tab-button ${activeBoard === '전체' ? 'active' : ''}`}
          onClick={() => handleBoardChange('전체')}
        >
          전체
        </button>
        <button 
          className={`tab-button ${activeBoard === '자유게시판' ? 'active' : ''}`}
          onClick={() => handleBoardChange('자유게시판')}
        >
          자유게시판
        </button>
        <button 
          className={`tab-button ${activeBoard === '질문게시판' ? 'active' : ''}`}
          onClick={() => handleBoardChange('질문게시판')}
        >
          질문게시판
        </button>
        <button 
          className={`tab-button ${activeBoard === '추천게시판' ? 'active' : ''}`}
          onClick={() => handleBoardChange('추천게시판')}
        >
          추천게시판
        </button>
        <button
          className="write-button"
          onClick={() => navigate('/community/write')}
        >
          <i className="fas fa-pen"></i> 글쓰기
        </button>
      </nav>

      <div className="posts-grid">
        {filteredPosts.map(post => (
          <article 
            key={post.id} 
            className="post-card"
            onClick={() => navigate(`/community/post/${post.id}`)}
            style={{ cursor: 'pointer' }}
          >
            {post.thumbnail && (
              <div className="post-thumbnail">
                <img src={post.thumbnail} alt={post.title} />
              </div>
            )}
            <div className="post-content">
              <div className="post-category">{post.category}</div>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-preview">{post.content}</p>
              <div className="post-tags">
                {post.tags?.map((tag, index) => (
                  <span key={index} className="post-tag">#{tag}</span>
                ))}
              </div>
              <div className="post-meta">
                <span className="post-author">{post.author}</span>
                <span className="post-time">
                  {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 
                   post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 
                   '날짜 없음'}
                </span>
              </div>
              <div className="post-stats">
                <span><i className="fas fa-eye"></i> {post.views || 0}</span>
                <span><i className="fas fa-heart"></i> {post.likes || 0}</span>
                <span><i className="fas fa-comment"></i> {post.commentCount || 0}</span>
              </div>
              {isAdmin && (
                <div className="admin-actions">
                  <button 
                    className="admin-button delete"
                    onClick={(e) => handleDeletePost(post.id, e)}
                  >
                    <i className="fas fa-trash"></i> 삭제
                  </button>
                  <button 
                    className="admin-button block"
                    onClick={(e) => handleBlockUser(post.userId, post.author, e)}
                  >
                    <i className="fas fa-ban"></i> 차단
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Community; 