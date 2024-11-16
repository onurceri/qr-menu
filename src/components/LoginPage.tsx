import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat } from 'lucide-react';

export function LoginPage() {
  const { user, signInWithGoogle, error } = useAuth();
  if (user) {
    return <Navigate to="/restaurants" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ChefHat className="h-12 w-12 text-zinc-900" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900">
          Restaurant Owner Login
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Sign in to manage your digital menu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-lg" role="alert">
              {error}
            </div>
          )}
          
          <button
            onClick={signInWithGoogle}
            className="w-full flex justify-center py-3 px-4 border border-transparent 
            rounded-md shadow-sm text-sm font-medium text-white 
            bg-zinc-900 hover:bg-zinc-800 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 
            transition duration-300"
          >
            <span className="flex items-center">
              <img 
                src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" 
                alt="Google logo" 
                className="h-5 w-5 mr-2" 
              />
              Sign in with Google
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}