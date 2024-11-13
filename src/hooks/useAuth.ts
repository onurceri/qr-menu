import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';

export interface AuthHook {
  user: User | null;
}

export const useAuth = (): AuthHook => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged((user: User | null) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    return { user };
};
