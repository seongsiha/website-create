import React, { useState } from 'react';
import './Filters.css';

const Filters = () => {
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [activeTags, setActiveTags] = useState([]);

  const handleFilter = () => {
    const newTags = [];
    if (selectedGenre) newTags.push({ type: 'genre', value: selectedGenre });
    if (selectedSort) newTags.push({ type: 'sort', value: selectedSort });
    if (selectedPlatform) newTags.push({ type: 'platform', value: selectedPlatform });
    setActiveTags(newTags);
  };

  const removeTag = (tagToRemove) => {
    setActiveTags(activeTags.filter(tag => tag !== tagToRemove));
    switch (tagToRemove.type) {
      case 'genre':
        setSelectedGenre('');
        break;
      case 'sort':
        setSelectedSort('');
        break;
      case 'platform':
        setSelectedPlatform('');
        break;
      default:
        break;
    }
  };

  return (
    <div className="filters">
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="genre" className="filter-label">장르</label>
          <select 
            id="genre"
            className="filter-select"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">장르 선택</option>
            <option value="판타지">판타지</option>
            <option value="로맨스">로맨스</option>
            <option value="액션">액션</option>
            <option value="미스터리">미스터리</option>
            <option value="라이트노벨">라이트노벨</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort" className="filter-label">정렬</label>
          <select 
            id="sort"
            className="filter-select"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
          >
            <option value="">정렬 기준</option>
            <option value="최신순">최신순</option>
            <option value="평점순">평점순</option>
            <option value="조회순">조회순</option>
            <option value="리뷰순">리뷰순</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="platform" className="filter-label">연재처</label>
          <select 
            id="platform"
            className="filter-select"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
          >
            <option value="">연재처 선택</option>
            <option value="카카오페이지">카카오페이지</option>
            <option value="네이버시리즈">네이버시리즈</option>
            <option value="리디북스">리디북스</option>
            <option value="문피아">문피아</option>
          </select>
        </div>

        <button className="filter-button" onClick={handleFilter}>
          필터 적용
        </button>
      </div>

      {activeTags.length > 0 && (
        <div className="filter-tags">
          {activeTags.map((tag, index) => (
            <span key={index} className="filter-tag">
              {tag.value}
              <button 
                className="filter-tag-remove"
                onClick={() => removeTag(tag)}
                aria-label={`${tag.value} 필터 제거`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Filters; 