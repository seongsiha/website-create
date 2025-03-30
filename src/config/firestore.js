import { getFirestore, collection, query, where, orderBy, limit, doc } from "firebase/firestore";

const db = getFirestore();

// 리뷰 데이터 구조화 예시
const reviewsRef = collection(db, "reviews");
const userReviewsQuery = query(
  reviewsRef,
  where("genre", "==", "판타지"),
  where("rating", ">=", 4),
  orderBy("createdAt", "desc")
);

// 복합 쿼리 예시
const popularReviewsQuery = query(
  reviewsRef,
  where("tags", "array-contains", "신작"),
  orderBy("views", "desc"),
  limit(10)
);

// 사용자와 리뷰 관계 처리
const userRef = doc(db, "users", userId);
const userReviews = query(
  reviewsRef,
  where("authorRef", "==", userRef),
  orderBy("createdAt")
); 