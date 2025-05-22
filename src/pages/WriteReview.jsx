import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase/config';
import './WriteReview.css';

const WriteReview = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState({
    title: '',
    novelTitle: '',
    rating: 5,
    content: '',
    genre: '판타지',
    tags: [],
    images: [],
    imageFiles: []
  });
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        alert('리뷰 작성을 위해서는 로그인이 필요합니다.');
        navigate('/login');
      }
    });

    if (reviewId) {
      setIsEditMode(true);
      loadReview();
    }

    return () => unsubscribe();
  }, [navigate, reviewId]);

  const loadReview = async () => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      const reviewDoc = await getDoc(reviewRef);
      
      if (reviewDoc.exists()) {
        const data = reviewDoc.data();
        setReviewData({
          title: data.title || '',
          novelTitle: data.novelTitle || '',
          content: data.content || '',
          rating: data.rating || 5,
          genre: data.genre || '판타지',
          tags: data.tags || [],
          images: data.images || [],
          imageFiles: []
        });
      }
    } catch (error) {
      console.error('리뷰 로드 실패:', error);
      setError('리뷰를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    
    // 태그 자동완성 로직
    if (value.length > 0) {
      const filteredTags = reviewData.tags.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestedTags(filteredTags);
    } else {
      setSuggestedTags([]);
    }
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !reviewData.tags.includes(trimmedTag)) {
      setReviewData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setTagInput('');
    setSuggestedTags([]);
  };

  const removeTag = (tagToRemove) => {
    setReviewData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('이미지는 최대 5개까지 업로드할 수 있습니다.');
      return;
    }
    
    // 파일 크기 체크 (각 파일 최대 5MB)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('각 이미지의 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    // 이미지 타입 체크
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    
    // 이미지 미리보기 생성
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setReviewData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls],
      imageFiles: [...prev.imageFiles, ...files]
    }));
    setError('');
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(reviewData.images[index]); // 메모리 해제
    setReviewData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
  };

  const uploadImages = async () => {
    if (!auth.currentUser) throw new Error('로그인이 필요합니다.');
    
    try {
      const uploadPromises = reviewData.imageFiles.map(async (file) => {
        try {
          // 파일명에서 특수문자 제거 및 타임스탬프 추가
          const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
          const fileName = `${Date.now()}_${safeFileName}`;
          
          // 경로를 reviews/{userId}/{fileName} 형식으로 통일
          const storageRef = ref(storage, `reviews/${auth.currentUser.uid}/${fileName}`);
          
          // 이미지 업로드 전 파일 타입 체크
          if (!file.type.startsWith('image/')) {
            throw new Error('이미지 파일만 업로드할 수 있습니다.');
          }

          // 파일 크기 체크 (5MB)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error('파일 크기는 5MB를 초과할 수 없습니다.');
          }

          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          return downloadURL;
        } catch (error) {
          console.error(`이미지 업로드 실패: ${file.name}`, error);
          throw new Error(`이미지 업로드 중 오류가 발생했습니다: ${file.name}`);
        }
      });

      return Promise.all(uploadPromises);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw new Error('이미지 업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 입력 검증
      if (!reviewData.title.trim()) {
        throw new Error('리뷰 제목을 입력해주세요.');
      }
      if (!reviewData.novelTitle.trim()) {
        throw new Error('작품 제목을 입력해주세요.');
      }
      if (!reviewData.content.trim()) {
        throw new Error('리뷰 내용을 입력해주세요.');
      }

      let imageUrls = reviewData.images;
      if (reviewData.imageFiles.length > 0) {
        try {
          imageUrls = await uploadImages();
        } catch (error) {
          throw new Error('이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      }

      const reviewDataToSave = {
        title: reviewData.title.trim(),
        novelTitle: reviewData.novelTitle.trim(),
        content: reviewData.content.trim(),
        rating: Number(reviewData.rating),
        genre: reviewData.genre,
        tags: reviewData.tags,
        images: imageUrls,
        updatedAt: serverTimestamp()
      };

      if (isEditMode) {
        // 수정 모드
        const reviewRef = doc(db, 'reviews', reviewId);
        await updateDoc(reviewRef, reviewDataToSave);
        alert('리뷰가 성공적으로 수정되었습니다!');
      } else {
        // 새 리뷰 작성 모드
        reviewDataToSave.userId = user.uid;
        reviewDataToSave.userEmail = user.email;
        reviewDataToSave.createdAt = serverTimestamp();
        reviewDataToSave.likes = 0;
        reviewDataToSave.comments = [];
        reviewDataToSave.views = 0;
        
        await addDoc(collection(db, 'reviews'), reviewDataToSave);
        alert('리뷰가 성공적으로 작성되었습니다!');
      }
      
      // 이미지 미리보기 URL 정리
      reviewData.images.forEach(url => URL.revokeObjectURL(url));

      navigate('/reviews');
    } catch (error) {
      console.error('리뷰 저장 중 오류 발생:', error);
      setError(error.message || '리뷰 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="write-review-container">
      <div className="write-review-header">
        <h1>{isEditMode ? '리뷰 수정' : '리뷰 작성'}</h1>
        <p>{isEditMode ? '리뷰를 수정해주세요' : '작품에 대한 솔직한 리뷰를 남겨주세요'}</p>
      </div>

      <form onSubmit={handleSubmit} className="write-review-form">
        <div className="form-group">
          <label htmlFor="novelTitle">작품 제목</label>
          <input
            type="text"
            id="novelTitle"
            name="novelTitle"
            value={reviewData.novelTitle}
            onChange={handleInputChange}
            placeholder="리뷰할 작품의 제목을 입력하세요"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="title">리뷰 제목</label>
          <input
            type="text"
            id="title"
            name="title"
            value={reviewData.title}
            onChange={handleInputChange}
            placeholder="리뷰의 제목을 입력하세요"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="genre">장르</label>
            <select
              id="genre"
              name="genre"
              value={reviewData.genre}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            >
              <option value="판타지">판타지</option>
              <option value="로맨스">로맨스</option>
              <option value="무협">무협</option>
              <option value="미스터리">미스터리</option>
              <option value="SF">SF</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rating">평점</label>
            <select
              id="rating"
              name="rating"
              value={reviewData.rating}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            >
              {[5, 4, 3, 2, 1].map(num => (
                <option key={num} value={num}>
                  {'★'.repeat(num)}{'☆'.repeat(5-num)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="content">리뷰 내용</label>
          <textarea
            id="content"
            name="content"
            value={reviewData.content}
            onChange={handleInputChange}
            placeholder="작품에 대한 솔직한 리뷰를 작성해주세요"
            required
            rows="10"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>태그</label>
          <div className="tag-input-container">
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagKeyDown}
              placeholder="태그 입력 후 엔터 (예: 로맨스판타지, 힐링물)"
              disabled={isSubmitting}
            />
            {suggestedTags.length > 0 && (
              <div className="tag-suggestions">
                {suggestedTags.map(tag => (
                  <div 
                    key={tag} 
                    className="tag-suggestion"
                    onClick={() => addTag(tag)}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="selected-tags">
            {reviewData.tags.map(tag => (
              <span key={tag} className="tag">
                #{tag}
                <button 
                  type="button" 
                  onClick={() => removeTag(tag)}
                  disabled={isSubmitting}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="images">이미지 첨부</label>
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="file-input"
            disabled={isSubmitting || reviewData.images.length >= 5}
          />
          <div className="image-preview-container">
            {reviewData.images.map((url, index) => (
              <div key={index} className="image-preview">
                <img src={url} alt={`미리보기 ${index + 1}`} />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => removeImage(index)}
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '리뷰 작성 중...' : '리뷰 작성하기'}
          </button>
          <button 
            type="button" 
            className="cancel-button" 
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteReview; 