import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "새_프로젝트_API_KEY",
  authDomain: "새프로젝트.firebaseapp.com",
  projectId: "새프로젝트",
  storageBucket: "새프로젝트.appspot.com",
  messagingSenderId: "새_메시징_ID",
  appId: "새_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const auth = getAuth(app); 