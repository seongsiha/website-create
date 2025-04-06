import React, { useState } from 'react';
import './Hero.css';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: 검색 로직 구현
    console.log('검색어:', searchQuery);
  };

  return (
    <section className="hero">
      <h1>당신이 다음으로 읽을 웹소설을 찾아보세요</h1>
      <p>다양한 장르의 웹소설 리뷰와 추천</p>
      <form onSubmit={handleSearch} className="search-container">
        <label htmlFor="search" className="sr-only">웹소설 검색</label>
        <input 
          id="search"
          type="search" 
          className="search-input" 
          placeholder="제목, 작가, 장르로 검색하세요"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="웹소설 검색"
        />
        <button 
          type="submit" 
          className="search-button"
          aria-label="검색하기"
        >
          🔍
        </button>
      </form>
    </section>
  );
};

export default Hero; 