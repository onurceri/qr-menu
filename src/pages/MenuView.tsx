import React, { useState } from 'react';
import { Header } from '../components/Header';
import { MenuSection } from '../components/MenuSection';
import { sampleRestaurant } from '../data/sampleData';

function MenuView() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        restaurantName={sampleRestaurant.name}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {sampleRestaurant.sections.map((section) => (
          <MenuSection key={section.id} section={section} />
        ))}
      </main>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      <div
        className={`fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl transform transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col py-6 px-4">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-lg font-medium text-gray-900">Menu Sections</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setIsSidebarOpen(false)}
            >
              ×
            </button>
          </div>
          <nav className="mt-6">
            {sampleRestaurant.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                onClick={() => setIsSidebarOpen(false)}
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default MenuView;