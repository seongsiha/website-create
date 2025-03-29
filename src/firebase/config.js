import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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