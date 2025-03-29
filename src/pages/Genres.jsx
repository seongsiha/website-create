import React, { useState } from 'react';
import './Genres.css';

const Genres = () => {
  const [activeCategory, setActiveCategory] = useState('인기');
  
  const categories = ['인기', '판타지', '로맨스', '무협', '라이트노벨', '현대판타지'];

  const genres = [
    {
      id: 1,
      title: "판타지",
      image: "https://placehold.co/400x300/4a90e2/ffffff.jpg?text=Fantasy",
      description: "현실을 벗어난 마법과 모험의 세계. 무한한 상상력이 펼쳐지는 판타지 장르의 모든 것",
      tags: ["마법", "모험", "영웅", "이세계"],
      stats: {
        works: 1234,
        reviews: 5678
      },
      trending: true
    },
    {
      id: 2,
      title: "로맨스",
      image: "https://placehold.co/400x300/e24a90/ffffff.jpg?text=Romance",
      description: "설렘과 감동이 가득한 로맨스 세계. 달콤한 사랑 이야기부터 절절한 멜로까지",
      tags: ["로맨스", "로맨스판타지", "현대물", "시대물"],
      stats: {
        works: 2345,
        reviews: 8901
      },
      trending: true
    }
  ];

  return (
    <div className="genres-container">
      <div className="page-header">
        <h1>장르별 작품</h1>
        <p>취향에 맞는 장르를 찾아보세요</p>
      </div>

      <nav className="genre-navigation">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <div className="genres-grid">
        {genres.map((genre) => (
          <article key={genre.id} className="genre-card">
            <div className="genre-image">
              <img src={genre.image} alt={genre.title} />
              {genre.trending && (
                <span className="trending-badge">
                  <i className="fas fa-fire"></i> 인기
                </span>
              )}
            </div>
            <div className="genre-content">
              <h2 className="genre-title">{genre.title}</h2>
              <p className="genre-description">{genre.description}</p>
              <div className="genre-tags">
                {genre.tags.map((tag, index) => (
                  <span key={index} className="genre-tag">{tag}</span>
                ))}
              </div>
              <div className="genre-stats">
                <div className="stat-item">
                  <i className="fas fa-book"></i>
                  <span>{genre.stats.works.toLocaleString()} 작품</span>
                </div>
                <div className="stat-item">
                  <i className="fas fa-star"></i>
                  <span>{genre.stats.reviews.toLocaleString()} 리뷰</span>
                </div>
              </div>
              <button className="explore-button">
                장르 탐색하기
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Genres; 