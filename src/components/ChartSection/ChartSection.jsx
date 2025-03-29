import React, { useState } from 'react';
import './ChartSection.css';

const ChartSection = () => {
  const [activeTab, setActiveTab] = useState('조회순');
  
  const chartData = [
    {
      rank: 1,
      title: '전생했더니 개발자였던 건에 대하여',
      author: '김코딩',
      views: '12,345',
      likes: '1,234',
      comments: '458',
      trend: { direction: 'up', value: 2 }
    },
    {
      rank: 2,
      title: '마법사의 아침은 버그와 함께',
      author: '이버그',
      views: '11,234',
      likes: '987',
      comments: '342',
      trend: { direction: 'down', value: 1 }
    },
    {
      rank: 3,
      title: '회귀한 암살자는 치킨을 좋아해',
      author: '박치킨',
      views: '10,123',
      likes: '876',
      comments: '256',
      trend: { direction: 'up', value: 5 }
    },
    {
      rank: 4,
      title: '이세계 스타트업',
      author: '정창업',
      views: '9,876',
      likes: '765',
      comments: '198',
      trend: { direction: 'same', value: 0 }
    },
    {
      rank: 5,
      title: '환생한 QA는 버그를 잡고 싶지 않아',
      author: '최테스터',
      views: '8,765',
      likes: '654',
      comments: '187',
      trend: { direction: 'up', value: 3 }
    }
  ];

  const renderTopThree = () => (
    <div className="chart-list">
      <h3 style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', fontWeight: '600', color: '#4338ca' }}>TOP 3 웹소설</h3>
      {chartData.slice(0, 3).map((item) => (
        <li key={item.rank} className="chart-item">
          <span className={`rank rank-${item.rank}`}>{item.rank}</span>
          <div className="novel-info">
            <div className="novel-title">{item.title}</div>
            <div className="novel-meta">
              <span>👤 {item.author}</span>
              <span>👁️ {item.views}</span>
              <span>❤️ {item.likes}</span>
              <span>💬 {item.comments}</span>
            </div>
          </div>
          <span className={`trend-indicator ${item.trend.direction}`}>
            {item.trend.direction === 'up' ? '▲' : item.trend.direction === 'down' ? '▼' : '•'} {item.trend.value}
          </span>
        </li>
      ))}
    </div>
  );

  const renderOthers = () => (
    <div className="chart-list">
      <h3 style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', fontWeight: '600', color: '#6b7280' }}>상승 중인 웹소설</h3>
      {chartData.slice(3, 5).map((item) => (
        <li key={item.rank} className="chart-item">
          <span className={`rank rank-${item.rank}`}>{item.rank}</span>
          <div className="novel-info">
            <div className="novel-title">{item.title}</div>
            <div className="novel-meta">
              <span>👤 {item.author}</span>
              <span>👁️ {item.views}</span>
              <span>❤️ {item.likes}</span>
              <span>💬 {item.comments}</span>
            </div>
          </div>
          <span className={`trend-indicator ${item.trend.direction}`}>
            {item.trend.direction === 'up' ? '▲' : item.trend.direction === 'down' ? '▼' : '•'} {item.trend.value}
          </span>
        </li>
      ))}
    </div>
  );

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h2 className="chart-title">실시간 인기 웹소설</h2>
        <div className="chart-tabs">
          {['조회순', '추천순', '리뷰순', '댓글순'].map((tab) => (
            <button
              key={tab}
              className={`chart-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-grid">
        {renderTopThree()}
        {renderOthers()}
      </div>
    </div>
  );
};

export default ChartSection; 