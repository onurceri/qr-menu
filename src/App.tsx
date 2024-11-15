import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import MenuView from './pages/MenuView';
import MenuEdit from './pages/MenuEdit';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MenuSection } from './components/MenuSection';

function App() {
  const [section, setSection] = useState<Section | null>(null);
  const { sectionId } = useParams();

  useEffect(() => {
    async function fetchSection() {
      try {
        const response = await fetch(`/api/sections/${sectionId}`);
        const data = await response.json();
        setSection(data);
      } catch (error) {
        console.error('Error fetching section:', error);
      }
    }
    fetchSection();
  }, [sectionId]);

  if (!section) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MenuView />} />
          <Route
            path="/edit"
            element={
              <ProtectedRoute>
                <MenuEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/:sectionId"
            element={
              <ProtectedRoute>
                <MenuSection section={section} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;