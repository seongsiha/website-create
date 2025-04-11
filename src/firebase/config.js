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
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 커뮤니티 게시글 컬렉션
const postsCollection = collection(db, 'posts');

// 태그 컬렉션
const tagsCollection = collection(db, 'tags');

// 게시글 태그 매핑 컬렉션
const postTagsCollection = collection(db, 'postTags');

// 댓글 컬렉션
const commentsCollection = collection(db, 'comments');

// 좋아요 컬렉션
const likesCollection = collection(db, 'likes');

// 모든 export를 하나로 통합
export {
  auth,
  db,
  storage,
  collection,
  query,
  orderBy,
  getDocs,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
  postsCollection,
  tagsCollection,
  postTagsCollection,
  commentsCollection,
  likesCollection
}; 