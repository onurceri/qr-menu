import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged((user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    return { user };
};
