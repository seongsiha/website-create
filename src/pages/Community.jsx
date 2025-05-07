import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postsCollection, query, orderBy, getDocs, where } from '../firebase/config';
import { limit } from 'firebase/firestore';
import './Community.css';

const Community = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <button className="tab-button active">전체</button>
        <button className="tab-button">자유게시판</button>
        <button className="tab-button">질문게시판</button>
        <button className="tab-button">추천게시판</button>
        <button
          className="write-button"
          onClick={() => navigate('/community/write')}
        >
          <i className="fas fa-pen"></i> 글쓰기
        </button>
      </nav>

      <div className="posts-grid">
        {posts.map(post => (
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
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Community; 