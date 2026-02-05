export type CarCategory = 'Chauffeur Driven' | 'Monthly Rental' | 'Sales';

export interface Car {
  id: string;
  brand: string;
  model: string;
  type: 'Sedan' | 'SUV' | 'Luxury';
  category: CarCategory;
  seats: number;
  image: string;
  images: string[];
  pricePerHour: number;
  description: string;
  features: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}


export enum Page {
  Home = 'home',
  Fleet = 'fleet',
  Services = 'services',
  Booking = 'booking',
  Properties = 'properties',
  LuxuryProducts = 'luxury-products',
  CharteredFlights = 'chartered-flights',
  HelicopterService = 'helicopters',
  YachtService = 'yachts',
  Admin = 'admin'
}
