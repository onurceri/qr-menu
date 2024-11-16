import React, { useState } from 'react';
import type { MenuSection as MenuSectionType } from '../types/restaurant';
import { ImageOff } from 'lucide-react';
import { CurrencyCode, formatPrice } from '../constants/currencies';

interface MenuSectionProps {
  section: MenuSectionType;
  currency: CurrencyCode;
}

export function MenuSection({ section, currency }: MenuSectionProps) {
  return (
    <div id={section.title} className="mb-8">
      <h2 className="text-2xl font-bold text-zinc-900 mb-4">{section.title}</h2>
      <div className="space-y-4">
        {section.items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 border border-zinc-200">
            <div className="flex">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/placeholder.png';
                  }}
                />
              ) : (
                <div className="w-24 h-24 bg-zinc-100 rounded-md flex items-center justify-center">
                  <ImageOff className="w-8 h-8 text-zinc-400" />
                </div>
              )}
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-zinc-900">{item.name}</h3>
                {item.description && (
                  <p className="text-zinc-600 mt-1 line-clamp-2">{item.description}</p>
                )}
                <p className="text-zinc-800 font-medium mt-2">
                  {formatPrice(item.price, currency)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}