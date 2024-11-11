import type { Restaurant } from '../types';

export const sampleRestaurant: Restaurant = {
  id: '1',
  name: 'Lezzet Köşesi',
  sections: [
    {
      id: '1',
      title: 'Başlangıçlar',
      items: [
        {
          id: '1',
          name: 'Mercimek Çorbası',
          description: 'Geleneksel Türk mercimek çorbası, taze limon ile servis edilir',
          price: 45.00,
          imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800',
        },
        {
          id: '2',
          name: 'Yaprak Sarma',
          description: 'Asma yaprağında pirinç dolması, yoğurt ile servis edilir',
          price: 65.00,
          imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
        },
      ],
    },
    {
      id: '2',
      title: 'Ana Yemekler',
      items: [
        {
          id: '3',
          name: 'Kuzu Tandır',
          description: 'Özel baharatlarla marine edilmiş, uzun süre pişirilmiş kuzu eti',
          price: 180.00,
          imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
        },
        {
          id: '4',
          name: 'Pide Çeşitleri',
          description: 'Kaşarlı, kıymalı veya karışık',
          price: 90.00,
        },
        {
          id: '5',
          name: 'İskender',
          description: 'Döner, pide, domates sosu ve yoğurt ile servis edilir',
          price: 160.00,
          imageUrl: 'https://invalid-image-url.jpg',
        },
      ],
    },
  ],
};