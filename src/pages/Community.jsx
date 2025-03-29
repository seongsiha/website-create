import React, { useState } from 'react';
import './Community.css';

const Community = () => {
  const [activeTab, setActiveTab] = useState('전체');

  const tabs = ['전체', '자유게시판', '작품토론', '리뷰어모집', '홍보'];
  
  const trendingKeywords = [
    '이세계 여행사', '마법공방', '판타지 추천', '로맨스 신작', '이달의 리뷰어'
  ];

  const posts = [
    {
      id: 1,
      category: '작품토론',
      title: "이세계 여행사 신작 어떠신가요?",
      author: "여행러버",
      preview: "최근에 시작한 이세계 여행사 시리즈가 상당히 흥미롭더라구요. 특히 주인공의 성장 과정이...",
      tags: ["토론", "이세계", "신작리뷰"],
      timeAgo: "1시간 전",
      views: 234,
      likes: 45,
      comments: 23,
      thumbnail: "https://placehold.co/300x200/4a90e2/ffffff.jpg?text=이세계+여행사"
    },
    {
      id: 2,
      category: '리뷰어모집',
      title: "마법공방 시리즈 체험단 모집합니다",
      author: "매직스튜디오",
      preview: "신작 '마법공방' 시리즈의 체험단을 모집합니다. 판타지 장르를 좋아하시는 분들의 많은 참여 부탁드립니다...",
      tags: ["모집", "판타지", "체험단"],
      timeAgo: "2시간 전",
      views: 567,
      likes: 89,
      comments: 34,
      thumbnail: "https://placehold.co/300x200/3730a3/ffffff.jpg?text=마법공방"
    }
  ];

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
          {trendingKeywords.map((keyword, index) => (
            <button key={index} className="trending-tag">
              <span className="tag-rank">{index + 1}</span>
              <span className="tag-name">{keyword}</span>
            </button>
          ))}
        </div>
      </div>

      <nav className="community-navigation">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <button className="write-button">
          <i className="fas fa-pen"></i> 글쓰기
        </button>
      </nav>

      <div className="posts-grid">
        {posts.map((post) => (
          <article key={post.id} className="post-card">
            {post.thumbnail && (
              <div className="post-thumbnail">
                <img src={post.thumbnail} alt={post.title} />
              </div>
            )}
            <div className="post-content">
              <div className="post-category">{post.category}</div>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-preview">{post.preview}</p>
              <div className="post-tags">
                {post.tags.map((tag, index) => (
                  <span key={index} className="post-tag">#{tag}</span>
                ))}
              </div>
              <div className="post-meta">
                <span className="post-author">{post.author}</span>
                <span className="post-time">{post.timeAgo}</span>
              </div>
              <div className="post-stats">
                <span><i className="fas fa-eye"></i> {post.views}</span>
                <span><i className="fas fa-heart"></i> {post.likes}</span>
                <span><i className="fas fa-comment"></i> {post.comments}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Community; 