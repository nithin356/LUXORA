/**
 * Map better images to Chauffeur Driven fleet entries
 */
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const FLEET_FILE = path.join(ROOT, 'data', 'fleet.json');

// Better image assignments for Chauffeur Driven
const imageRules = [
  // BMW
  { brand: 'BMW', models: ['7 Series'], image: '/uploads/cd-bmw-7series.jpg' },
  { brand: 'BMW', models: ['X1', 'X3', 'X5', 'X6', 'X7'], image: '/uploads/sales-bmw-suv.jpg' },
  { brand: 'BMW', models: ['3 Series', '5 Series'], image: '/uploads/sales-bmw-sedan.jpg' },
  { brand: 'BMW', models: ['Z4'], image: '/uploads/cd-sportscar-elite.jpg' },

  // Audi
  { brand: 'Audi', models: ['A8', 'A7'], image: '/uploads/cd-audi-luxury.jpg' },
  { brand: 'Audi', models: ['Q7', 'Q8', 'Q5', 'Q3', 'Q2'], image: '/uploads/sales-audi-suv.jpg' },
  { brand: 'Audi', models: ['A4', 'A3', 'A6', 'A5'], image: '/uploads/sales-audi-sedan.jpg' },
  { brand: 'Audi', models: ['A3 Convertible', 'R8'], image: '/uploads/cd-sportscar-elite.jpg' },

  // Mercedes-Benz
  { brand: 'Mercedes-Benz', models: ['S Class'], image: '/uploads/cd-mercedes-luxury.jpg' },
  { brand: 'Mercedes-Benz', models: ['GLA', 'GLC', 'GLE', 'GLS', 'ML Class'], image: '/uploads/sales-mercedes-sedan.jpg' },
  { brand: 'Mercedes-Benz', models: ['C Class', 'E Class'], image: '/uploads/sales-mercedes-sedan.jpg' },
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
];

async function main() {
  const fleet = await fs.readJson(FLEET_FILE);
  let updated = 0;

  for (let i = 0; i < fleet.length; i++) {
    const car = fleet[i];
    if (car.category !== 'Chauffeur Driven') continue;

    for (const rule of imageRules) {
      if (car.brand === rule.brand && rule.models.includes(car.model)) {
        fleet[i].image = rule.image;
        fleet[i].images = [rule.image];
        updated++;
        console.log(`  ✅ ${car.brand} ${car.model} (${car.fleetTier}) -> ${rule.image}`);
        break;
      }
    }
  }

  await fs.writeJson(FLEET_FILE, fleet, { spaces: 2 });
  console.log(`\n✅ Updated ${updated} car images.`);
}

main().catch(console.error);
