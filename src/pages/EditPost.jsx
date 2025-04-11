import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import TagInput from '../components/TagSystem/TagInput';
import './EditPost.css';

const EditPost = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('자유게시판');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          if (postData.userId !== auth.currentUser?.uid && postData.author !== auth.currentUser?.email) {
            alert('게시글 수정 권한이 없습니다.');
            navigate('/community');
            return;
          }
          setTitle(postData.title);
          setContent(postData.content);
          setCategory(postData.category || '자유게시판');
          setTags(postData.tags || []);
        } else {
          setError('게시글을 찾을 수 없습니다.');
          navigate('/community');
        }
      } catch (err) {
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (auth.currentUser) {
      fetchPost();
    } else {
      navigate('/login');
    }
  }, [postId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      await updateDoc(doc(db, 'posts', postId), {
        title: title.trim(),
        content: content.trim(),
        category,
        tags,
        updatedAt: new Date()
      });
      alert('게시글이 수정되었습니다.');
      navigate(`/community/post/${postId}`);
    } catch (err) {
      setError('게시글 수정 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="edit-post-container">
      <div className="edit-post-box">
        <h2>게시글 수정</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="자유게시판">자유게시판</option>
              <option value="질문게시판">질문게시판</option>
              <option value="추천게시판">추천게시판</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
            />
          </div>
          <div className="form-group">
            <label htmlFor="content">내용</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows="10"
            />
          </div>
          <div className="form-group">
            <label>태그</label>
            <TagInput selectedTags={tags} setSelectedTags={setTags} />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="cancel-button">
              취소
            </button>
            <button type="submit" className="submit-button">
              수정하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost; 