export interface Product {
  id: string;
  titleFR: string;
  titleAR: string;
  descriptionFR: string;
  descriptionAR: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  badgeFR?: string;
  badgeAR?: string;
  rating: number;
  reviewsCount: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  featuresFR: string[];
  featuresAR: string[];
}

export interface Category {
  id: string;
  nameFR: string;
  nameAR: string;
  image: string;
  count: number;
}

export interface Wilaya {
  code: string;
  nameFR: string;
  nameAR: string;
  homePrice: number;
  deskPrice: number;
  communes: string[];
}

export interface OrderForm {
  fullName: string;
  phone: string;
  wilayaCode: string;
  commune: string;
  address: string;
  deliveryType: "home" | "desk";
  notes?: string;
  quantity: number;
}
