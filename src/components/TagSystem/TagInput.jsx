import React, { useState, useEffect } from 'react';
import { 
  tagsCollection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from '../../firebase/config';
import './TagInput.css';

const TagInput = ({ selectedTags, setSelectedTags }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestedTags, setSuggestedTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      if (inputValue.length > 0) {
        try {
          const q = query(
            tagsCollection, 
            where('tagName', '>=', inputValue.toLowerCase()), 
            where('tagName', '<=', inputValue.toLowerCase() + '\uf8ff')
          );
          const querySnapshot = await getDocs(q);
          const tags = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSuggestedTags(tags);
        } catch (error) {
          console.error('태그 검색 중 오류:', error);
          setSuggestedTags([]);
        }
      } else {
        setSuggestedTags([]);
      }
    };

    fetchTags();
  }, [inputValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      
      if (!selectedTags.includes(newTag)) {
        try {
          // 태그가 존재하는지 확인
          const q = query(tagsCollection, where('tagName', '==', newTag));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            // 새로운 태그 생성
            await addDoc(tagsCollection, {
              tagName: newTag,
              count: 1,
              createdAt: serverTimestamp()
            });
          }
          
          setSelectedTags([...selectedTags, newTag]);
          setInputValue('');
        } catch (error) {
          console.error('태그 생성 중 오류:', error);
        }
      } else {
        setInputValue('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="tag-input-container">
      <div className="selected-tags">
        {selectedTags && selectedTags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
            <button onClick={() => removeTag(tag)} className="remove-tag">×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="태그를 입력하고 엔터를 누르세요"
        className="tag-input"
      />
      {suggestedTags.length > 0 && (
        <div className="suggested-tags">
          {suggestedTags.map((tag, index) => (
            <button
              key={index}
              className="suggested-tag"
              onClick={() => {
                if (!selectedTags.includes(tag.tagName)) {
                  setSelectedTags([...selectedTags, tag.tagName]);
                }
                setInputValue('');
              }}
            >
              {tag.tagName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput; 