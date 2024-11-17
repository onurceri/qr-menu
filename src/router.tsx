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
import { GlobalHeader } from './components/GlobalHeader';

export function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-50">
          <GlobalHeader />
          <div className="pt-16">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<LandingPage />} />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}