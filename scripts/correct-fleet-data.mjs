/**
 * Correct Fleet Data Script
 * 
 * 1. Takes the 31 existing 'Sales' cars.
 * 2. Maps them to the correct Chauffeur Driven Tier (Gold/Platinum/Diamond/Elite).
 * 3. Applies the correct Rental Packages.
 * 4. Removes all other cars (the generic ones).
 * 5. Saves the result as the new fleet.json (total 31 cars).
 */
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const FLEET_FILE = path.join(ROOT, 'data', 'fleet.json');

// Pricing Rules (Duration in Hours, KM Limit, Price in INR)
const PRICING = {
  Gold: [
    { duration: 6, kmLimit: 80, price: 8000 },
    { duration: 10, kmLimit: 120, price: 12000 },
    { duration: 24, kmLimit: 200, price: 20000 }
  ],
  Platinum: [
    { duration: 6, kmLimit: 80, price: 11000 },
    { duration: 10, kmLimit: 120, price: 15000 },
    { duration: 24, kmLimit: 200, price: 25000 }
  ],
  Diamond: [
    { duration: 6, kmLimit: 100, price: 15000 },
    { duration: 10, kmLimit: 150, price: 20000 },
    { duration: 24, kmLimit: 250, price: 30000 }
  ],
  Elite: [
    { duration: 6, kmLimit: 80, price: 30000 },
    { duration: 12, kmLimit: 120, price: 40000 },
    { duration: 24, kmLimit: 200, price: 50000 }
  ]
};

// Image Mapping Rules (Same as map-cd-images.mjs)
const imageRules = [
  // BMW
  { brand: 'BMW', models: ['7 Series', '730ld'], image: '/uploads/cd-bmw-7series.jpg' },
  { brand: 'BMW', models: ['X1', 'X3', 'X5', 'X6', 'X7', '520d', '530d', '5 Series'], image: '/uploads/sales-bmw-suv.jpg' }, // Fallback for 5 series/suv mixed
  { brand: 'BMW', models: ['3 Series', '5 Series', '520d', '730ld'], image: '/uploads/sales-bmw-sedan.jpg' }, // Specific override if needed
  { brand: 'BMW', models: ['Z4'], image: '/uploads/cd-sportscar-elite.jpg' },

  // Audi
  { brand: 'Audi', models: ['A8', 'A7'], image: '/uploads/cd-audi-luxury.jpg' },
  { brand: 'Audi', models: ['Q7', 'Q8', 'Q5', 'Q3', 'Q2'], image: '/uploads/sales-audi-suv.jpg' },
  { brand: 'Audi', models: ['A4', 'A3', 'A6', 'A5', 'S6'], image: '/uploads/sales-audi-sedan.jpg' },
  { brand: 'Audi', models: ['A3 Convertible', 'R8'], image: '/uploads/cd-sportscar-elite.jpg' },

  // Mercedes-Benz
  { brand: 'Mercedes-Benz', models: ['S Class', 'Gl350', 'GLS'], image: '/uploads/cd-mercedes-luxury.jpg' },
  { brand: 'Mercedes-Benz', models: ['GLA', 'GLC', 'GLE', 'GLS', 'ML Class'], image: '/uploads/sales-mercedes-sedan.jpg' },
  { brand: 'Mercedes-Benz', models: ['C Class', 'E Class', 'C200'], image: '/uploads/sales-mercedes-sedan.jpg' },
  { brand: 'Mercedes-Benz', models: ['SLK'], image: '/uploads/cd-sportscar-elite.jpg' },

  // Volvo
  { brand: 'Volvo', models: ['V40', 'S60', 'S80'], image: '/uploads/cd-volvo-sedan.jpg' },
  { brand: 'Volvo', models: ['XC60', 'XC90'], image: '/uploads/sales-volvo-suv.jpg' },

  // Range Rover / Land Rover
  { brand: 'Range Rover', models: ['Vogue', 'Sport'], image: '/uploads/cd-rangerover-vogue.jpg' },
  { brand: 'Range Rover', models: ['Evoque'], image: '/uploads/sales-evoque.jpg' },
  { brand: 'Land Rover', models: ['Discovery', 'Freelander'], image: '/uploads/sales-landrover-suv.jpg' },

  // Porsche
  { brand: 'Porsche', models: ['Cayenne', 'Macan'], image: '/uploads/cd-porsche-cayenne.jpg' },

  // Mini Cooper
  { brand: 'Mini Cooper', models: ['Countryman', 'Cooper S', 'Convertible'], image: '/uploads/cd-mini-cooper.jpg' },
  
  // Aston Martin
  { brand: 'Aston Martin', models: ['Vantage'], image: '/uploads/cd-sportscar-elite.jpg' } // Fallback
];

function getImageForCar(car) {
  const carName = (car.brand + " " + car.model).toLowerCase();
  
  // Specific Overrides first
  if (carName.includes("730ld") || carName.includes("7 series")) return '/uploads/cd-bmw-7series.jpg';
  if (carName.includes("xc60")) return '/uploads/sales-volvo-suv.jpg';
  if (carName.includes("evoque")) return '/uploads/sales-evoque.jpg';
  if (carName.includes("cayenne")) return '/uploads/cd-porsche-cayenne.jpg';
  if (carName.includes("gl350")) return '/uploads/cd-mercedes-luxury.jpg';
  if (carName.includes("q7")) return '/uploads/sales-audi-suv.jpg';
  if (carName.includes("x6")) return '/uploads/sales-bmw-suv.jpg';

  // Generic Rules
  for (const rule of imageRules) {
    if (car.brand.toLowerCase() === rule.brand.toLowerCase()) {
      for (const model of rule.models) {
        if (carName.includes(model.toLowerCase())) {
          return rule.image;
        }
      }
    }
  }
  
  return car.image; // Keep original if no match
}

// Helper to determine Tier based on Model/Brand logic
function getTier(car) {
  const name = (car.brand + " " + car.model).toLowerCase();
  
  // Elite
  if (name.includes("aston martin") || name.includes("vantage")) return "Elite";
  
  // Diamond
  if (name.includes("7 series") || name.includes("730ld")) return "Diamond";
  if (name.includes("x6")) return "Diamond"; // X6 is coupe SUV, likely Diamond
  if (name.includes("a8")) return "Diamond";
  if (name.includes("q7")) return "Diamond";
  if (name.includes("s class") || name.includes("gls") || name.includes("gl350")) return "Diamond";
  if (name.includes("xc90")) return "Diamond";
  if (name.includes("range rover vogue") || name.includes("range rover sport")) return "Diamond";
  if (name.includes("porsche") || name.includes("cayenne")) return "Diamond";
  
  // Platinum
  if (name.includes("5 series") || name.includes("520d") || name.includes("530d")) return "Platinum";
  if (name.includes("x3") || name.includes("x5")) return "Platinum";
  if (name.includes("a6") || name.includes("s6") || name.includes("q5")) return "Platinum";
  if (name.includes("e class") || name.includes("gle") || name.includes("ml")) return "Platinum";
  if (name.includes("xc60")) return "Platinum"; // Volve XC60
  if (name.includes("evoque")) return "Platinum"; // Range Rover Evoque
  if (name.includes("jaguar") || name.includes("xf")) return "Platinum"; // Jaguar XF
  if (name.includes("discovery")) return "Platinum";
  
  // Gold (Everything else basically)
  if (name.includes("3 series") || name.includes("x1")) return "Gold";
  if (name.includes("a4") || name.includes("q3") || name.includes("a3")) return "Gold";
  if (name.includes("c class") || name.includes("c200") || name.includes("gla")) return "Gold";
  if (name.includes("v40") || name.includes("s60")) return "Gold";
  if (name.includes("freelander")) return "Gold";
  if (name.includes("mini")) return "Gold";

  return "Gold"; // Default
}

async function main() {
  const currentFleet = await fs.readJson(FLEET_FILE);
  
  // Keep ONLY the cars that were originally imported as 'Sales' (the 31 cars)
  // We identify them because we set their category to 'Sales' in bulk-add-sales.mjs
  const originalCars = currentFleet.filter(c => c.category === 'Sales');
  
  if (originalCars.length === 0) {
    console.error("❌ No 'Sales' cars found to convert! Aborting to avoid data loss.");
    return;
  }

  console.log(`Found ${originalCars.length} cars to convert from Sales -> Chauffeur Driven.`);

  const newFleet = originalCars.map(car => {
    const tier = getTier(car);
    const pricing = PRICING[tier];
    const newImage = getImageForCar(car);

    // Preserve existing ID but ensure clean data
    return {
      ...car,
      category: "Chauffeur Driven",
      fleetTier: tier,
      type: car.type || "Luxury", // Preserve or default
      image: newImage,
      images: [newImage],
      pricePerHour: Math.round(pricing[0].price / pricing[0].duration), // Estimator
      packages: pricing,
      securityOptions: [
        { id: "sec-std", label: "Standard (Driver only)", carCount: 1, bodyguardCount: 0, price: 0 },
        { id: "sec-plus", label: "Executive Protection", carCount: 2, bodyguardCount: 2, price: 15000 }
      ],
      paymentPolicy: {
        advancePercentage: 10,
        arrivalPercentage: 90
      },
      vipOptions: {
        bodyguard: true,
        personalConcierge: true,
        premiumRefreshments: true,
        customRoute: true
      }
    };
  });

  // Sort by Tier (Elite -> Diamond -> Platinum -> Gold)
  const tierOrder = { "Elite": 0, "Diamond": 1, "Platinum": 2, "Gold": 3 };
  newFleet.sort((a, b) => tierOrder[a.fleetTier] - tierOrder[b.fleetTier]);

  console.log("\nConversion Summary:");
  const summary = {};
  newFleet.forEach(c => {
    summary[c.fleetTier] = (summary[c.fleetTier] || 0) + 1;
    console.log(`  [${c.fleetTier.padEnd(8)}] ${c.brand} ${c.model}`);
  });
  
  console.log("\nCounts by Tier:", summary);
  console.log(`Total Fleet Size: ${newFleet.length}`);

  // Save
  await fs.writeJson(FLEET_FILE, newFleet, { spaces: 2 });
  console.log(`\n✅ fleet.json updated successfully!`);
}

main().catch(console.error);
