import { useMutation, useQuery } from '@tanstack/react-query';
import type { Restaurant } from '../types';

export function useRestaurant(restaurantId: string) {
  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => fetch(`/api/restaurants/${restaurantId}`).then(res => res.json()),
  });

  const { mutateAsync: updateRestaurant } = useMutation({
    mutationFn: (updates: Partial<Restaurant>) =>
      fetch(`/api/restaurants/${restaurantId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
      }).then(res => res.json()),
  });

  return { restaurant, isLoading, error, updateRestaurant };
} 