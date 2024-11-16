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

export interface Restaurant {
  _id?: string;
  userId: string;
  name: string;
  sections: MenuSection[];
  currency: CurrencyCode;
  __v?: number;
}