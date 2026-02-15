export type CarCategory = "Chauffeur Driven" | "Monthly Rental" | "Sales";
export type FleetTier = "Normal" | "Elite" | "Platinum" | "VIP" | "Gold" | "Diamond";

export interface RentalPackage {
  duration: number; // in hours (4, 6, 12, 24)
  kmLimit: number;
  price: number;
}

export interface SecurityOption {
  id: string;
  carCount: number;
  bodyguardCount: number;
  label: string;
  price?: number; // Optional if dynamic
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  type: "Sedan" | "SUV" | "Luxury";
  category: CarCategory;
  fleetTier: FleetTier;
  seats: number;
  image: string;
  images: string[];
  pricePerHour: number;
  description: string;
  features: string[];
  packages?: RentalPackage[];
  securityOptions?: SecurityOption[];
  paymentPolicy?: {
    advancePercentage: number; // 10
    arrivalPercentage: number; // 90
  };
  vipOptions?: {
    bodyguard?: boolean;
    personalConcierge?: boolean;
    premiumRefreshments?: boolean;
    customRoute?: boolean;
  };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export enum Page {
  Home = "home",
  Fleet = "fleet",
  Services = "services",
  Booking = "booking",
  Properties = "properties",
  LuxuryProducts = "luxury-products",
  CharteredFlights = "chartered-flights",
  HelicopterService = "helicopters",
  YachtService = "yachts",
  Admin = "admin",
}
