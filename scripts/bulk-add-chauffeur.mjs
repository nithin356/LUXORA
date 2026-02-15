/**
 * Bulk Add Chauffeur Driven Fleet + Sports Cars
 * Based on handwritten tier classification notes
 * 
 * Tier Package Pricing:
 *   Gold:     6h/80km/₹8K,   10h/120km/₹12K,  24h/200km/₹20K
 *   Platinum: 6h/80km/₹11K,  10h/120km/₹15K,  24h/200km/₹25K
 *   Diamond:  6h/100km/₹15K, 10h/150km/₹20K,  24h/250km/₹30K
 *   Elite:    6h/80km/₹30K,  12h/120km/₹40K,  24h/200km/₹50K
 */
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const FLEET_FILE = path.join(ROOT, 'data', 'fleet.json');

// Standard packages by tier
const tierPackages = {
  Gold: [
    { duration: 6, kmLimit: 80, price: 8000 },
    { duration: 10, kmLimit: 120, price: 12000 },
    { duration: 24, kmLimit: 200, price: 20000 },
  ],
  Platinum: [
    { duration: 6, kmLimit: 80, price: 11000 },
    { duration: 10, kmLimit: 120, price: 15000 },
    { duration: 24, kmLimit: 200, price: 25000 },
  ],
  Diamond: [
    { duration: 6, kmLimit: 100, price: 15000 },
    { duration: 10, kmLimit: 150, price: 20000 },
    { duration: 24, kmLimit: 250, price: 30000 },
  ],
  Elite: [
    { duration: 6, kmLimit: 80, price: 30000 },
    { duration: 12, kmLimit: 120, price: 40000 },
    { duration: 24, kmLimit: 200, price: 50000 },
  ],
};

// Image mapping - uses images already downloaded + generic brand images
const brandImages = {
  "BMW_sedan":  "/uploads/sales-bmw-sedan.jpg",
  "BMW_suv":    "/uploads/sales-bmw-suv.jpg",
  "Audi_sedan": "/uploads/sales-audi-sedan.jpg",
  "Audi_suv":   "/uploads/sales-audi-suv.jpg",
  "Mercedes-Benz_sedan": "/uploads/sales-mercedes-sedan.jpg",
  "Mercedes-Benz_suv": "/uploads/sales-mercedes-sedan.jpg",
  "Volvo_sedan": "/uploads/sales-volvo-suv.jpg",
  "Volvo_suv":   "/uploads/sales-volvo-suv.jpg",
  "Range Rover_suv": "/uploads/sales-evoque.jpg",
  "Land Rover_suv": "/uploads/sales-landrover-suv.jpg",
  "Porsche_suv": "/uploads/sales-porsche-suv.jpg",
  "Mini Cooper_suv": "/uploads/sales-landrover-suv.jpg",
  "sports": "/uploads/sales-astonmartin.jpg",
};

function getImage(brand, type) {
  return brandImages[`${brand}_${type}`] || brandImages["BMW_sedan"];
}

// Full Chauffeur Driven Fleet from the notes
const chauffeurFleet = [
  // ===== BMW =====
  // Gold
  { brand: "BMW", model: "X1", tier: "Gold", type: "SUV", seats: 5 },
  { brand: "BMW", model: "3 Series", tier: "Gold", type: "Sedan", seats: 5 },
  // Platinum
  { brand: "BMW", model: "5 Series", tier: "Platinum", type: "Sedan", seats: 5 },
  { brand: "BMW", model: "X3", tier: "Platinum", type: "SUV", seats: 5 },
  { brand: "BMW", model: "X5", tier: "Platinum", type: "SUV", seats: 7 },
  // Diamond
  { brand: "BMW", model: "7 Series", tier: "Diamond", type: "Sedan", seats: 5 },
  { brand: "BMW", model: "X6", tier: "Diamond", type: "SUV", seats: 5 },
  { brand: "BMW", model: "X7", tier: "Diamond", type: "SUV", seats: 7 },

  // ===== AUDI =====
  // Gold
  { brand: "Audi", model: "A4", tier: "Gold", type: "Sedan", seats: 5 },
  { brand: "Audi", model: "Q3", tier: "Gold", type: "SUV", seats: 5 },
  { brand: "Audi", model: "Q2", tier: "Gold", type: "SUV", seats: 5 },
  { brand: "Audi", model: "A3", tier: "Gold", type: "Sedan", seats: 5 },
  // Platinum
  { brand: "Audi", model: "A6", tier: "Platinum", type: "Sedan", seats: 5 },
  { brand: "Audi", model: "Q5", tier: "Platinum", type: "SUV", seats: 5 },
  { brand: "Audi", model: "A5", tier: "Platinum", type: "Sedan", seats: 4 },
  // Diamond
  { brand: "Audi", model: "A8", tier: "Diamond", type: "Luxury", seats: 5 },
  { brand: "Audi", model: "Q7", tier: "Diamond", type: "SUV", seats: 7 },
  { brand: "Audi", model: "Q8", tier: "Diamond", type: "SUV", seats: 5 },
  { brand: "Audi", model: "A7", tier: "Diamond", type: "Sedan", seats: 5 },

  // ===== MERCEDES-BENZ =====
  // Gold
  { brand: "Mercedes-Benz", model: "C Class", tier: "Gold", type: "Sedan", seats: 5 },
  { brand: "Mercedes-Benz", model: "GLA", tier: "Gold", type: "SUV", seats: 5 },
  // Platinum
  { brand: "Mercedes-Benz", model: "E Class", tier: "Platinum", type: "Sedan", seats: 5 },
  { brand: "Mercedes-Benz", model: "GLC", tier: "Platinum", type: "SUV", seats: 5 },
  { brand: "Mercedes-Benz", model: "GLE", tier: "Platinum", type: "SUV", seats: 5 },
  { brand: "Mercedes-Benz", model: "ML Class", tier: "Platinum", type: "SUV", seats: 7 },
  // Diamond
  { brand: "Mercedes-Benz", model: "S Class", tier: "Diamond", type: "Luxury", seats: 5 },
  { brand: "Mercedes-Benz", model: "GLS", tier: "Diamond", type: "SUV", seats: 7 },

  // ===== VOLVO =====
  // Gold
  { brand: "Volvo", model: "V40", tier: "Gold", type: "Sedan", seats: 5 },
  { brand: "Volvo", model: "S60", tier: "Gold", type: "Sedan", seats: 5 },
  // Platinum
  { brand: "Volvo", model: "XC60", tier: "Platinum", type: "SUV", seats: 5 },
  { brand: "Volvo", model: "S80", tier: "Platinum", type: "Sedan", seats: 5 },
  // Diamond
  { brand: "Volvo", model: "XC90", tier: "Diamond", type: "SUV", seats: 7 },

  // ===== RANGE ROVER / LAND ROVER =====
  // Gold
  { brand: "Land Rover", model: "Freelander", tier: "Gold", type: "SUV", seats: 5 },
  // Platinum
  { brand: "Range Rover", model: "Evoque", tier: "Platinum", type: "SUV", seats: 5 },
  { brand: "Land Rover", model: "Discovery", tier: "Platinum", type: "SUV", seats: 7 },
  // Diamond
  { brand: "Range Rover", model: "Vogue", tier: "Diamond", type: "Luxury", seats: 5 },
  { brand: "Range Rover", model: "Sport", tier: "Diamond", type: "SUV", seats: 5 },

  // ===== PORSCHE =====
  // Diamond
  { brand: "Porsche", model: "Cayenne", tier: "Diamond", type: "SUV", seats: 5 },
  { brand: "Porsche", model: "Macan", tier: "Diamond", type: "SUV", seats: 5 },

  // ===== MINI COOPER =====
  // Gold
  { brand: "Mini Cooper", model: "Countryman", tier: "Gold", type: "SUV", seats: 5 },
  // Platinum
  { brand: "Mini Cooper", model: "Cooper S", tier: "Platinum", type: "Sedan", seats: 4 },
  // Diamond
  { brand: "Mini Cooper", model: "Convertible", tier: "Diamond", type: "Luxury", seats: 4 },
];

// Sports Cars - Elite Tier
const sportsCars = [
  { brand: "Mercedes-Benz", model: "SLK", tier: "Elite", type: "Luxury", seats: 2 },
  { brand: "BMW", model: "Z4", tier: "Elite", type: "Luxury", seats: 2 },
  { brand: "Audi", model: "A3 Convertible", tier: "Elite", type: "Luxury", seats: 4 },
  { brand: "Audi", model: "R8", tier: "Elite", type: "Luxury", seats: 2 },
];

const descriptions = {
  "BMW": "The ultimate driving machine. German engineering at its finest with dynamic performance and premium luxury.",
  "Audi": "Vorsprung durch Technik. Progressive luxury with Quattro all-wheel drive and cutting-edge technology.",
  "Mercedes-Benz": "The best or nothing. The pinnacle of German automotive refinement, comfort, and prestige.",
  "Volvo": "Swedish engineering excellence with industry-leading safety and understated Scandinavian luxury.",
  "Range Rover": "The definitive luxury SUV. Commanding presence with unmatched off-road capability.",
  "Land Rover": "Legendary adventure capability meets refined British luxury and craftsmanship.",
  "Porsche": "Engineering perfection from Stuttgart. Uncompromising performance meets everyday usability.",
  "Mini Cooper": "British motoring icon. Stylish, fun-to-drive, and unmistakably premium.",
};

const features = {
  "BMW": ["iDrive Navigation", "Harman Kardon Premium Audio", "M Sport Package", "Full Leather Interior", "Ambient Lighting"],
  "Audi": ["Quattro AWD", "MMI Navigation Plus", "Bang & Olufsen 3D Audio", "Virtual Cockpit", "Leather Sport Seats"],
  "Mercedes-Benz": ["COMAND Infotainment", "Burmester Surround Audio", "AIRMATIC Suspension", "Nappa Leather", "Ambient Lighting"],
  "Volvo": ["Pilot Assist", "Bowers & Wilkins Audio", "Inscription Trim", "Nappa Leather Seats", "City Safety"],
  "Range Rover": ["Terrain Response 2", "Meridian Signature Audio", "Panoramic Roof", "Windsor Leather", "All-Terrain Progress Control"],
  "Land Rover": ["Terrain Response", "Meridian Audio", "Panoramic Sunroof", "Grained Leather", "Wade Sensing"],
  "Porsche": ["Sport Chrono Package", "BOSE Surround Sound", "PASM Suspension", "Alcantara & Leather", "PCM Navigation"],
  "Mini Cooper": ["Connected Navigation", "Harman Kardon Audio", "Sport Suspension", "Leather Lounge Seats", "Head-Up Display"],
};

const securityOptions = [
  { id: 'sec-1-1', carCount: 1, bodyguardCount: 1, label: '1 Car / 1 Bodyguard', price: 0 },
  { id: 'sec-1-2', carCount: 1, bodyguardCount: 2, label: '1 Car / 2 Bodyguards', price: 0 },
  { id: 'sec-2-4', carCount: 2, bodyguardCount: 4, label: '2 Cars / 4 Bodyguards', price: 0 },
];

async function main() {
  console.log("🚀 Adding Chauffeur Driven Fleet + Sports Cars...\n");

  const fleet = await fs.readJson(FLEET_FILE);
  const allCars = [...chauffeurFleet, ...sportsCars];
  let added = 0;

  for (const car of allCars) {
    const isSport = car.tier === "Elite";
    const imgType = (car.type === "SUV") ? "suv" : "sedan";
    const image = isSport ? brandImages["sports"] : getImage(car.brand, imgType);
    const packages = tierPackages[car.tier] || tierPackages.Gold;
    const basePrice = packages[0].price / packages[0].duration; // Hourly fallback

    const newCar = {
      id: `${car.brand.toLowerCase().replace(/\s+/g, '-')}-${car.model.toLowerCase().replace(/\s+/g, '-')}-cd-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      brand: car.brand,
      model: car.model,
      type: car.type,
      category: "Chauffeur Driven",
      fleetTier: car.tier,
      seats: car.seats,
      image: image,
      images: [image],
      pricePerHour: Math.round(basePrice),
      description: `${car.brand} ${car.model} — ${isSport ? "Elite Sports Experience. " : ""}${descriptions[car.brand] || "Premium luxury vehicle."} Available for chauffeur-driven rental with professional drivers.`,
      features: features[car.brand] || ["Premium Interior", "Climate Control", "Premium Audio"],
      packages: packages,
      securityOptions: (car.tier === "Diamond" || car.tier === "Elite") ? securityOptions : [],
      paymentPolicy: { advancePercentage: 10, arrivalPercentage: 90 },
      vipOptions: {
        bodyguard: car.tier === "Diamond" || car.tier === "Elite",
        personalConcierge: car.tier === "Diamond" || car.tier === "Elite" || car.tier === "Platinum",
        premiumRefreshments: car.tier !== "Gold",
        customRoute: true,
      },
    };

    fleet.push(newCar);
    added++;
    
    const tierIcon = { Gold: "🥇", Platinum: "🏆", Diamond: "💎", Elite: "⚡" }[car.tier] || "🔹";
    console.log(`  ${tierIcon} ${car.tier.padEnd(8)} | ${car.brand.padEnd(14)} ${car.model.padEnd(16)} | ${car.type}`);
  }

  await fs.writeJson(FLEET_FILE, fleet, { spaces: 2 });

  // Summary
  const cdCars = fleet.filter(c => c.category === "Chauffeur Driven");
  const tiers = {};
  cdCars.forEach(c => { tiers[c.fleetTier] = (tiers[c.fleetTier] || 0) + 1; });

  console.log(`\n🎉 SUCCESS! Added ${added} Chauffeur Driven vehicles.`);
  console.log(`   Total fleet: ${fleet.length}`);
  console.log(`   Chauffeur Driven: ${cdCars.length}`);
  console.log(`   Tier breakdown:`);
  Object.entries(tiers).sort().forEach(([t, c]) => console.log(`     ${t}: ${c}`));
}

main().catch(console.error);
