import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './Hero.css';

const MAX_SUGGESTIONS = 8;

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    // 모든 리뷰의 태그를 파이어베이스에서 불러옴
    const fetchTags = async () => {
      const reviewsRef = collection(db, 'reviews');
      const snapshot = await getDocs(reviewsRef);
      const tagsSet = new Set();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.tags && Array.isArray(data.tags)) {
          data.tags.forEach(tag => tagsSet.add(tag));
        }
      });
      setAllTags(Array.from(tagsSet));
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lower = searchQuery.toLowerCase();
    const filteredTags = allTags.filter(tag => tag.toLowerCase().includes(lower)).slice(0, MAX_SUGGESTIONS);
    setSuggestions(filteredTags);
    setShowSuggestions(filteredTags.length > 0);
  }, [searchQuery, allTags]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (value) => {
    setSearchQuery(value);
    navigate(`/search?query=${encodeURIComponent(value)}`);
    setShowSuggestions(false);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 100); // 클릭 이벤트 보장
  };

  return (
    <section className="hero">
      <h1>당신이 다음으로 읽을 웹소설을 찾아보세요</h1>
      <p>다양한 장르의 웹소설 리뷰와 추천</p>
      <form onSubmit={handleSearch} className="search-container" autoComplete="off">
        <label htmlFor="search" className="sr-only">웹소설 검색</label>
        <input 
          id="search"
          type="search" 
          className="search-input" 
          placeholder="제목, 작가, 장르로 검색하세요"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={handleInputBlur}
          aria-label="웹소설 검색"
          ref={inputRef}
        />
        <button 
          type="submit" 
          className="search-button"
          aria-label="검색하기"
        >
          🔍
        </button>
        {showSuggestions && (
          <div className="autocomplete-suggestions">
            <div className="suggestion-group">
              <div className="suggestion-label">태그 추천</div>
              {suggestions.map((tag, idx) => (
                <div key={tag + idx} className="suggestion-item" onMouseDown={() => handleSuggestionClick(tag)}>
                  {tag}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </section>
  );
};

export default Hero; 