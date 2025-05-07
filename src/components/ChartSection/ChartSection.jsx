import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './ChartSection.css';

const ChartSection = () => {
  const [activeTab, setActiveTab] = useState('조회순');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      const now = new Date();
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const reviewsRef = collection(db, 'reviews');
      // createdAt이 최근 2주 이내인 리뷰만
      const q = query(reviewsRef, where('createdAt', '>=', twoWeeksAgo));
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          author: data.userEmail || '익명',
          views: data.views || 0,
          likes: data.likes || 0,
          comments: data.comments || 0,
          createdAt: data.createdAt,
        };
      });
      // 조회수+좋아요 합산 기준 내림차순 정렬
      const sorted = reviews.sort((a, b) => (b.views + b.likes) - (a.views + a.likes));
      // 랭킹 부여
      const ranked = sorted.map((item, idx) => ({ ...item, rank: idx + 1 }));
      setChartData(ranked);
    };
    fetchChartData();
  }, []);

  const renderTopFive = () => (
    <div className="chart-list">
      <h3 style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', fontWeight: '600', color: '#4338ca' }}>TOP 5 웹소설</h3>
      {chartData.slice(0, 5).map((item) => (
        <li key={item.rank} className="chart-item">
          <span className={`rank rank-${item.rank}`}>{item.rank}</span>
          <div className="novel-info">
            <div className="novel-title">{item.title}</div>
            <div className="novel-meta">
              <span>👤 {item.author}</span>
              <span>👁️ {item.views.toLocaleString()}</span>
              <span>❤️ {item.likes.toLocaleString()}</span>
              <span>💬 {item.comments.toLocaleString()}</span>
            </div>
          </div>
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
        {renderTopFive()}
      </div>
    </div>
  );
};

export default ChartSection; 