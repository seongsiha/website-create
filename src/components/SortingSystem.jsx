const SortingSystem = () => {
  const sortOptions = {
    latest: '최신순',
    views: '조회수순',
    likes: '좋아요순',
    rating: '평점순'
  };

  const handleSort = async (sortBy) => {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      orderBy(sortBy, 'desc'),
      limit(20)
    );
    // 결과 처리
  };
}; 