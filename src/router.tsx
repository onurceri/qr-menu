// src/router.ts
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MenuView from './pages/MenuView';
import NotFound from './components/NotFound';
import { LoginPage } from './components/LoginPage';
import MenuEdit from './pages/MenuEdit';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import RestaurantList from './pages/RestaurantList';
import LandingPage from './pages/LandingPage';
import { GlobalHeader } from './components/GlobalHeader';
import { RestaurantProfile } from './pages/RestaurantProfile';
import { RestaurantEdit } from './pages/RestaurantEdit';
import { Profile } from './pages/Profile';

export function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-50">
          <GlobalHeader />
          <div className="pt-16">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/restaurants" element={
                <ProtectedRoute>
                  <RestaurantList />
                </ProtectedRoute>
              } />
              <Route path="/menu/:menuId" element={<MenuView />} />
              <Route path="/edit/menu/:menuId" element={
                <ProtectedRoute>
                  <MenuEdit />
                </ProtectedRoute>
              } />
              <Route path="/restaurant/:restaurantId" element={<RestaurantProfile />} />
              <Route path="/restaurant/:restaurantId/edit" element={
                <ProtectedRoute>
                  <RestaurantEdit />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}