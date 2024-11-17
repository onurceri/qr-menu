import { useContext } from 'react';
import { User } from 'firebase/auth';
import { AuthContext } from '../contexts/AuthContext';

export interface AuthHook {
  user: User | null;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
}

export const useAuth = (): AuthHook => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
