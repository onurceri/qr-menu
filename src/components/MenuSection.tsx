import React, { useEffect, useState } from 'react';
import type { MenuSection as MenuSectionType } from '../types';
import { ImageOff } from 'lucide-react';

interface MenuSectionProps {
  section: MenuSectionType;
}

export function MenuSection({ section }: MenuSectionProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  return (
    <section 
      id={section.title} 
      className="mb-8 pt-16 -mt-16 scroll-mt-16 relative"
    >
      <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative aspect-video" style={{ minHeight: '200px' }}>
              {item.imageUrl && !imageErrors[item.id] ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    console.error(`Failed to load image: ${item.imageUrl}`);
                    setImageErrors(prev => ({
                      ...prev,
                      [item.id]: true
                    }));
                  }}
                />
              ) : (
                <div className="h-full bg-gray-100 flex items-center justify-center">
                  <ImageOff className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
              <p className="mt-2 text-gray-600 text-sm">{item.description}</p>
              <p className="mt-2 text-emerald-600 font-medium">{item.price} ₺</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}