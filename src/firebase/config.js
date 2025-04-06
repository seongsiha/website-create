import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  getDocs,
  where,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBMKFWfLrxhnMbxuPBed10KNbv_7VyvKJE",
  authDomain: "test-27718.firebaseapp.com",
  projectId: "test-27718",
  storageBucket: "test-27718.firebasestorage.app",
  messagingSenderId: "205274131162",
  appId: "1:205274131162:web:80b85aae7a03fc864f93e3",
  measurementId: "G-H7J67JE4V9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 커뮤니티 게시글 컬렉션
export const postsCollection = collection(db, 'posts');

// 태그 컬렉션
export const tagsCollection = collection(db, 'tags');

// 게시글 태그 매핑 컬렉션
export const postTagsCollection = collection(db, 'postTags');

// 댓글 컬렉션
export const commentsCollection = collection(db, 'comments');

// Firestore 함수들 export
export { 
  query, 
  orderBy, 
  getDocs, 
  where, 
  addDoc,
  serverTimestamp 
}; 