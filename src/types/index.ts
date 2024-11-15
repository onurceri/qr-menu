export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  sections: MenuSection[];
  userId: string;
}