import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GlobalHeader } from './components/GlobalHeader';
import LandingPage from './pages/LandingPage';
import { LoginPage } from './components/LoginPage';
import MenuEdit from './pages/MenuEdit';
import MenuView from './pages/MenuView';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-zinc-50">
          <GlobalHeader />
          <div className="pt-16">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/:restaurantId" element={<MenuView />} />
              <Route
                path="/edit/:restaurantId"
                element={
                  <ProtectedRoute>
                    <MenuEdit />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;