const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'fleet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// ---- TIER PRICING STRUCTURE (reference image) ----
// Gold:     4hr/40km = ₹3,999   | 8hr/80km = ₹5,999   | 12hr/120km = ₹7,999   | 24hr/200km = ₹12,999
// Platinum: 4hr/40km = ₹5,999   | 8hr/80km = ₹8,999   | 12hr/120km = ₹11,999  | 24hr/200km = ₹18,999
// Diamond:  4hr/40km = ₹8,499   | 8hr/80km = ₹12,999  | 12hr/120km = ₹16,999  | 24hr/200km = ₹25,999
// Elite:    4hr/40km = ₹15,999  | 8hr/80km = ₹24,999  | 12hr/120km = ₹32,999  | 24hr/200km = ₹45,999
// VIP:      4hr/40km = ₹25,999  | 8hr/80km = ₹39,999  | 12hr/120km = ₹54,999  | 24hr/200km = ₹79,999

const tierPackages = {
  Gold: {
    pricePerHour: 999,
    packages: [
      { duration: 4, kmLimit: 40, price: 3999 },
      { duration: 8, kmLimit: 80, price: 5999 },
      { duration: 12, kmLimit: 120, price: 7999 },
      { duration: 24, kmLimit: 200, price: 12999 }
    ]
  },
  Platinum: {
    pricePerHour: 1499,
    packages: [
      { duration: 4, kmLimit: 40, price: 5999 },
      { duration: 8, kmLimit: 80, price: 8999 },
      { duration: 12, kmLimit: 120, price: 11999 },
      { duration: 24, kmLimit: 200, price: 18999 }
    ]
  },
  Diamond: {
    pricePerHour: 2199,
    packages: [
      { duration: 4, kmLimit: 40, price: 8499 },
      { duration: 8, kmLimit: 80, price: 12999 },
      { duration: 12, kmLimit: 120, price: 16999 },
      { duration: 24, kmLimit: 200, price: 25999 }
    ]
  },
  Elite: {
    pricePerHour: 3999,
    packages: [
      { duration: 4, kmLimit: 40, price: 15999 },
      { duration: 8, kmLimit: 80, price: 24999 },
      { duration: 12, kmLimit: 120, price: 32999 },
      { duration: 24, kmLimit: 200, price: 45999 }
    ]
  },
  VIP: {
    pricePerHour: 6499,
    packages: [
      { duration: 4, kmLimit: 40, price: 25999 },
      { duration: 8, kmLimit: 80, price: 39999 },
      { duration: 12, kmLimit: 120, price: 54999 },
      { duration: 24, kmLimit: 200, price: 79999 }
    ]
  }
};

// Update existing cars with new tier pricing
data.forEach(car => {
  const tier = car.fleetTier;
  if (tierPackages[tier]) {
    car.pricePerHour = tierPackages[tier].pricePerHour;
    car.packages = tierPackages[tier].packages;
  }
});

// ---- ADD VIP VEHICLES ----
const vipBase = {
  category: "Chauffeur Driven",
  fleetTier: "VIP",
  pricePerHour: tierPackages.VIP.pricePerHour,
  packages: tierPackages.VIP.packages,
  vipOptions: {
    bodyguard: true,
    personalConcierge: true,
    premiumRefreshments: true,
    customRoute: true
  },
  securityOptions: [
    { id: "sec-std", label: "Standard (Driver only)", carCount: 1, bodyguardCount: 0, price: 0 },
    { id: "sec-plus", label: "Executive Protection", carCount: 2, bodyguardCount: 2, price: 25000 },
    { id: "sec-elite", label: "Full Convoy Security", carCount: 3, bodyguardCount: 4, price: 50000 }
  ],
  paymentPolicy: { advancePercentage: 25, arrivalPercentage: 75 },
  status: "Available"
};

const vipCars = [
  {
    id: "rolls-royce-ghost-2020-vip-001",
    brand: "Rolls-Royce",
    model: "Ghost",
    type: "Luxury",
    seats: 4,
    image: "/uploads/cd-mercedes-luxury.jpg",
    images: ["/uploads/cd-mercedes-luxury.jpg"],
    description: "Rolls-Royce Ghost. The ultimate expression of luxury motoring. Whisper-quiet cabin with handcrafted perfection.",
    features: [
      "Starlight Headliner",
      "Bespoke Audio",
      "Lamb's Wool Carpets",
      "Spirit of Ecstasy"
    ]
  },
  {
    id: "bentley-continental-gt-2019-vip-002",
    brand: "Bentley",
    model: "Continental GT",
    type: "Luxury",
    seats: 4,
    image: "/uploads/cd-sportscar-elite.jpg",
    images: ["/uploads/cd-sportscar-elite.jpg"],
    description: "Bentley Continental GT. Grand touring perfection with handcrafted British luxury and exhilarating performance.",
    features: [
      "Naim Audio System",
      "Diamond Quilted Leather",
      "Rotating Display",
      "W12 Twin-Turbo"
    ]
  },
  {
    id: "mercedes-maybach-s580-2021-vip-003",
    brand: "Mercedes-Maybach",
    model: "S 580",
    type: "Sedan",
    seats: 4,
    image: "/uploads/cd-mercedes-luxury.jpg",
    images: ["/uploads/cd-mercedes-luxury.jpg"],
    description: "Mercedes-Maybach S 580. The pinnacle of Mercedes luxury. First-class rear seating with executive comfort.",
    features: [
      "Executive Rear Seats",
      "Burmester 4D Audio",
      "Chauffeur Package",
      "MBUX Rear Tablet"
    ]
  }
];

vipCars.forEach(car => {
  data.push({ ...car, ...vipBase, id: car.id, brand: car.brand, model: car.model, type: car.type, seats: car.seats, image: car.image, images: car.images, description: car.description, features: car.features });
});

// ---- ALSO ADD an Elite car (Lamborghini) ----
data.push({
  id: "lamborghini-huracan-2020-elite-002",
  brand: "Lamborghini",
  model: "Huracán",
  type: "Luxury",
  category: "Chauffeur Driven",
  fleetTier: "Elite",
  seats: 2,
  image: "/uploads/cd-sportscar-elite.jpg",
  images: ["/uploads/cd-sportscar-elite.jpg"],
  pricePerHour: tierPackages.Elite.pricePerHour,
  description: "Lamborghini Huracán. Italian supercar excellence with naturally-aspirated V10 fury and jaw-dropping design.",
  features: [
    "V10 Engine",
    "Carbon Ceramic Brakes",
    "LDVI Technology",
    "Forged Composites"
  ],
  vipOptions: {
    bodyguard: true,
    personalConcierge: true,
    premiumRefreshments: true,
    customRoute: true
  },
  packages: tierPackages.Elite.packages,
  securityOptions: [
    { id: "sec-std", label: "Standard (Driver only)", carCount: 1, bodyguardCount: 0, price: 0 },
    { id: "sec-plus", label: "Executive Protection", carCount: 2, bodyguardCount: 2, price: 15000 }
  ],
  paymentPolicy: { advancePercentage: 15, arrivalPercentage: 85 },
  status: "Available"
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

// Print summary
const tiers = {};
data.forEach(car => {
  const t = car.fleetTier;
  tiers[t] = tiers[t] || { count: 0, cars: [] };
  tiers[t].count++;
  tiers[t].cars.push(`${car.brand} ${car.model} (${car.type})`);
});

console.log('\n✅ Fleet updated successfully!\n');
console.log('Tier distribution:');
Object.entries(tiers).forEach(([tier, info]) => {
  console.log(`\n  ${tier} (${info.count} cars):`);
  info.cars.forEach(c => console.log(`    - ${c}`));
});

console.log('\nPackage pricing:');
Object.entries(tierPackages).forEach(([tier, cfg]) => {
  const base = cfg.packages[0];
  console.log(`  ${tier}: ${base.duration}hr/${base.kmLimit}km = ₹${base.price.toLocaleString('en-IN')}`);
});
