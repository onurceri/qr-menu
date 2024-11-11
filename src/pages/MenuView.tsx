import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, ChevronUp } from 'lucide-react';
import { MenuSection } from '../components/MenuSection';
import { sampleRestaurant } from '../data/sampleData';

function MenuView() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">{sampleRestaurant.name}</h1>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
              aria-label="Open menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed left-8 top-24 w-48 space-y-1">
        {sampleRestaurant.sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
          >
            {section.title}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-16 lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {sampleRestaurant.sections.map((section) => (
            <div key={section.id} id={section.id}>
              <MenuSection section={section} />
            </div>
          ))}
        </div>
      </main>

      {/* Mobile Navigation Sidebar */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity z-50 lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      <div
        className={`fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl transform transition-transform z-50 lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col py-6">
          <div className="px-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Menu Sections</h2>
            <button
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              ×
            </button>
          </div>
          <nav className="mt-6 px-4 space-y-1">
            {sampleRestaurant.sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed right-4 bottom-4 p-3 bg-emerald-600 text-white rounded-full shadow-lg transition-opacity hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
          showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-6 w-6" />
      </button>
    </div>
  );
}

export default MenuView;