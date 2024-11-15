// src/router.ts
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MenuView from './components/MenuView';
import NotFound from './components/NotFound';
import { LoginPage } from './components/LoginPage';
import MenuEdit from './pages/MenuEdit';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

export function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MenuView />} />
          <Route path="/:restaurantId" element={<MenuView />} />
          <Route
            path="/edit"
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