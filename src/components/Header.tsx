import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  restaurantName: string;
  onMenuClick: () => void;
}

export function Header({ restaurantName, onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Make sure this button is clickable and calls onMenuClick */}
            <button
              onClick={onMenuClick}  // This should trigger the sidebar
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">{restaurantName}</h1>
          </div>
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/edit')}
                  className="btn"
                >
                  Edit Menu
                </button>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <User className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}