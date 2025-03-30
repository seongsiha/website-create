import { getDatabase, ref, onValue, set } from "firebase/database";

// Realtime Database 초기화
const db = getDatabase();

// 데이터 읽기 예시
const commentsRef = ref(db, 'comments');
onValue(commentsRef, (snapshot) => {
  const data = snapshot.val();
  console.log('실시간 댓글:', data);
});

// 데이터 쓰기 예시
function writeComment(commentId, text, userId) {
  set(ref(db, 'comments/' + commentId), {
    text: text,
    userId: userId,
    timestamp: Date.now()
  });
} 