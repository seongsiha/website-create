import React, { useState, useRef } from 'react';
import './PostUpload.css';

const PostUpload = () => {
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: ''
  });
  
  const imageInputRef = useRef(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#4a90e2';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#ddd';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#ddd';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 서버로 전송할 데이터 준비
    const submitData = {
      ...formData,
      hasImage: !!imagePreview
    };

    console.log('게시물 등록:', submitData);
    alert('게시물이 등록되었습니다.');
  };

  return (
    <div className="post-container">
      <div className="page-header">
        <h1>게시물 작성</h1>
        <p>여러분의 생각을 공유해주세요</p>
      </div>

      <form onSubmit={handleSubmit}>
        <select 
          className="category-select" 
          required
          name="category"
          value={formData.category}
          onChange={handleInputChange}
        >
          <option value="">카테고리 선택</option>
          <option value="free">자유게시판</option>
          <option value="review">작품리뷰</option>
          <option value="discussion">작품토론</option>
          <option value="recommend">작품추천</option>
        </select>

        <div className="form-group">
          <label htmlFor="title">제목</label>
          <input 
            type="text" 
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required 
            placeholder="제목을 입력하세요"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">내용</label>
          <textarea 
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required 
            placeholder="내용을 입력하세요"
          />
        </div>

        <div className="image-upload">
          <label htmlFor="imageInput" className="upload-label">
            📸 이미지 첨부하기
          </label>
          <input
            type="file"
            id="imageInput"
            ref={imageInputRef}
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files[0])}
          />
          
          <div 
            className={`image-preview ${imagePreview ? 'has-image' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!imagePreview && (
              <p className="drag-text">이미지를 드래그하여 첨부할 수 있습니다</p>
            )}
            {imagePreview && (
              <>
                <img 
                  src={imagePreview} 
                  alt="미리보기" 
                  className="preview-image" 
                  style={{ display: 'block' }}
                />
                <button 
                  type="button" 
                  className="remove-image"
                  onClick={removeImage}
                  style={{ display: 'block' }}
                >
                  ×
                </button>
              </>
            )}
          </div>
        </div>

        <button type="submit" className="submit-button">
          게시물 등록
        </button>
      </form>
    </div>
  );
};

export default PostUpload; 