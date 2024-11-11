import React from 'react';
import type { MenuSection as MenuSectionType } from '../types';
import { ImageOff } from 'lucide-react';

interface MenuSectionProps {
  section: MenuSectionType;
}

export function MenuSection({ section }: MenuSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {section.items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {item.imageUrl ? (
              <div className="relative w-full h-48">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('image-error');
                  }}
                />
                <div className="hidden image-error absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <ImageOff className="h-12 w-12 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <ImageOff className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <span className="text-lg font-bold text-emerald-600">
                  ₺{item.price.toFixed(2)}
                </span>
              </div>
              {item.description && (
                <p className="text-gray-600 text-sm">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}