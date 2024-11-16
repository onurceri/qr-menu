import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    UserCredential,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';

// Initialize Firebase
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const authService = {
    async login(email: string, password: string) {
        return signInWithEmailAndPassword(auth, email, password);
    },

    async register(email: string, password: string) {
        return createUserWithEmailAndPassword(auth, email, password);
    },

    async logout() {
        return signOut(auth);
    },

    onAuthStateChanged(callback: (user: User | null) => void) {
        return onAuthStateChanged(auth, callback);
    },

    getCurrentUser() {
        return auth.currentUser;
    },

    signInWithGoogle: async (): Promise<UserCredential> => {
        const googleProvider = new GoogleAuthProvider();
        return await signInWithPopup(auth, googleProvider);
    }
};