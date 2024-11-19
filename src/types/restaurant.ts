import type { CurrencyCode } from '../constants/currencies';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  _id?: string;
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
  _id?: string;
}

export interface Menu {
  id: string;
  language: string;
  name: string;
  description?: string;
  sections: MenuSection[];
  currency: CurrencyCode;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Restaurant {
  restaurantId: string;
  userId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  address?: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  openingHours?: string;
  menus: Menu[];
  location?: {
    type: string;
    coordinates: number[];
    isManuallySet: boolean;
  };
}