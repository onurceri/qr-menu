import React, { createContext, useContext } from 'react';
import { useRestaurant } from '../hooks/useRestaurant';
import type { Restaurant } from '../types';

interface RestaurantContextType {
  restaurant: Restaurant | null;
  isLoading: boolean;
  error: Error | null;
  updateRestaurant: (updates: Partial<Restaurant>) => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

interface RestaurantProviderProps {
  restaurantId: string;
  children: React.ReactNode;
}

export function RestaurantProvider({ restaurantId, children }: RestaurantProviderProps) {
  const restaurantData = useRestaurant(restaurantId);

  return (
    <RestaurantContext.Provider value={restaurantData}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurantContext() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurantContext must be used within a RestaurantProvider');
  }
  return context;
}