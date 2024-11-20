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
import { auth, googleProvider } from '../lib/firebase';

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
        return await signInWithPopup(auth, googleProvider);
    }
};