import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBxR3pxWGhfvlQ3MR1dVm7Q_Ey_tNFgpqo",
  authDomain: "digital-menu-platform-dev.firebaseapp.com",
  projectId: "digital-menu-platform-dev",
  storageBucket: "digital-menu-platform-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);