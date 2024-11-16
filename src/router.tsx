// src/router.ts
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MenuView from './pages/MenuView';
import NotFound from './components/NotFound';
import { LoginPage } from './components/LoginPage';
import MenuEdit from './pages/MenuEdit';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import RestaurantList from './pages/RestaurantList';
import LandingPage from './pages/LandingPage';

export function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/:restaurantId" element={<MenuView />} />
          <Route
            path="/edit/:restaurantId"
            element={
              <ProtectedRoute>
                <MenuEdit />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}