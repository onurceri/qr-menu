import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCB0wQv_8ws4MfPa6Kkf78b5c9i6Jxlric",
  authDomain: "restaurant-menu-dev.firebaseapp.com",
  projectId: "qr-menu-ef3a7",
  storageBucket: "restaurant-menu-dev.appspot.com",
  messagingSenderId: "32232487373",
  appId: "1:170427468908:web:b2d9c54b1e67cdc2f6c3e8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();