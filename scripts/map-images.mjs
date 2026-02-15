/**
 * Map Downloaded Images to Fleet Entries
 * Updates fleet.json with the correct image paths from downloaded Pexels images
 */
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const FLEET_FILE = path.join(ROOT, 'data', 'fleet.json');

// Map brand+model patterns to downloaded image files
const imageMap = {
  // SUVs
  "Range Rover": "/uploads/sales-evoque.jpg",
  "Volvo": "/uploads/sales-volvo-suv.jpg",
  "Land Rover": "/uploads/sales-landrover-suv.jpg",
  
  // Sedans by brand 
  "Jaguar": "/uploads/sales-jaguar-sedan.jpg",
  "Aston Martin": "/uploads/sales-astonmartin.jpg",
  "Porsche": "/uploads/sales-porsche-suv.jpg",
};

// Model-specific overrides (more specific matching)
const modelImageMap = {
  "Evoque": "/uploads/sales-evoque.jpg",
  "XC60": "/uploads/sales-volvo-suv.jpg",
  "GLA": "/uploads/sales-mercedes-sedan.jpg",
  "GL350": "/uploads/sales-mercedes-sedan.jpg",
  "C200": "/uploads/sales-mercedes-sedan.jpg",
  "C200 Petrol": "/uploads/sales-mercedes-sedan.jpg",
  "A6 Matrix": "/uploads/sales-audi-sedan.jpg",
  "A4": "/uploads/sales-audi-sedan.jpg",
  "S6": "/uploads/sales-audi-sedan.jpg",
  "Q7": "/uploads/sales-audi-suv.jpg",
  "Q3": "/uploads/sales-audi-suv.jpg",
  "XFS": "/uploads/sales-jaguar-sedan.jpg",
  "X6": "/uploads/sales-bmw-suv.jpg",
  "X3": "/uploads/sales-bmw-suv.jpg",
  "730LD": "/uploads/sales-bmw-sedan.jpg",
  "520D": "/uploads/sales-bmw-sedan.jpg",
  "530D": "/uploads/sales-bmw-sedan.jpg",
  "Freelander 2": "/uploads/sales-landrover-suv.jpg",
  "Cayenne": "/uploads/sales-porsche-suv.jpg",
  "Vantage": "/uploads/sales-astonmartin.jpg",
};

async function main() {
  console.log("🖼️  Mapping images to fleet entries...\n");

  const fleet = await fs.readJson(FLEET_FILE);
  let updated = 0;

  for (let i = 0; i < fleet.length; i++) {
    const car = fleet[i];
    if (car.category !== 'Sales') continue;
    
    // Skip if car already has a valid image
    if (car.image && car.image !== '' && !car.image.includes('undefined')) continue;

    // Extract clean model name (remove year in parentheses)
    const cleanModel = car.model.replace(/\s*\(\d{4}\)/, '');
    
    // Try model-specific match first
    let img = modelImageMap[cleanModel];
    
    // Fall back to brand match
    if (!img) {
      img = imageMap[car.brand];
    }
    
    // Fall back to generic luxury car
    if (!img) {
      img = "/uploads/sales-mercedes-sedan.jpg"; // Safe fallback
    }

    fleet[i].image = img;
    fleet[i].images = [img];
    updated++;
    console.log(`  ✅ ${car.brand} ${car.model} -> ${img}`);
  }

  await fs.writeJson(FLEET_FILE, fleet, { spaces: 2 });

  // Final stats
  const salesCars = fleet.filter(c => c.category === 'Sales');
  const noImage = salesCars.filter(c => !c.image || c.image === '');
  console.log(`\n📊 Results:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Total Sales: ${salesCars.length}`);
  console.log(`   Still missing images: ${noImage.length}`);
}

main().catch(console.error);
