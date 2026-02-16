import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 파이어베이스 프로젝트 설정
const firebaseConfig = {
  apiKey: "AIzaSyCQJyclPaKXjDMLKc9EQog68mK6bYpQSkg",
  authDomain: "lexquard-d6b13.firebaseapp.com",
  projectId: "lexquard-d6b13",
  storageBucket: "lexquard-d6b13.firebasestorage.app",
  messagingSenderId: "121482468181",
  appId: "1:121482468181:web:fee2c286c33d9fc1166ddc",
  measurementId: "G-99ZX01CWQ8"
};

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);

// 인증(로그인)과 DB(데이터베이스) 도구를 내보냅니다.
export const auth = getAuth(app);
export const db = getFirestore(app);