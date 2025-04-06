import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postsCollection, query, orderBy, getDocs } from '../firebase/config';
import './Community.css';

const Community = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(postsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(postsData);
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
            <i className="fas fa-chart-line"></i>
            트렌딩 키워드
          </h2>
          <span className="trending-update">실시간 업데이트</span>
        </div>
        <div className="trending-keywords">
          {['이세계 여행사', '마법공방', '판타지 추천', '로맨스 신작', '이달의 리뷰어'].map((keyword, index) => (
            <button key={index} className="trending-tag">
              <span className="tag-rank">{index + 1}</span>
              <span className="tag-name">{keyword}</span>
            </button>
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