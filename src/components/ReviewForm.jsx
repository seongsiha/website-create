import React, { useState } from 'react';
import { serverTimestamp } from 'firebase/firestore';

const ReviewForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [coverImage, setCoverImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reviewData = {
      title,
      content,
      tags,
      authorId: currentUser.uid,
      createdAt: serverTimestamp(),
      likes: 0,
      views: 0
    };
    // Firestore에 저장
  };

  return (
    <div>
      {/* 폼 부분을 여기에 추가해야 합니다 */}
    </div>
  );
};

export default ReviewForm; 