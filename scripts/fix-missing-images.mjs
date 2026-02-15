/**
 * Fix Missing Images Script
 * Downloads images for cars that failed in the first attempt
 * Uses Unsplash source URLs (free, reliable, no auth needed)
 */
import fs from 'fs-extra';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const UPLOADS_DIR = path.join(ROOT, 'uploads');
const FLEET_FILE = path.join(ROOT, 'data', 'fleet.json');

function downloadFile(url, dest, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        try { fs.unlinkSync(dest); } catch(e) {}
        return downloadFile(response.headers.location, dest, maxRedirects - 1).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch(e) {}
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', (err) => {
      file.close();
      try { fs.unlinkSync(dest); } catch(e) {}
      reject(err);
    });
  });
}

// Unsplash source URLs - these return random images matching the query
// format: https://source.unsplash.com/800x600/?query
const searchQueries = {
  "Range Rover": "range+rover+evoque+car",
  "Audi A6": "audi+a6+sedan",
  "Audi A4": "audi+a4+sedan",
  "Audi S6": "audi+s6+sedan",
  "Audi Q7": "audi+q7+suv",
  "Audi Q3": "audi+q3+suv",
  "Jaguar": "jaguar+xf+sedan",
  "BMW X6": "bmw+x6+suv",
  "BMW X3": "bmw+x3+suv",
  "Land Rover": "land+rover+freelander+suv",
  "Porsche": "porsche+cayenne+suv",
};

async function main() {
  console.log("🔧 Fixing missing car images...\n");

  const fleet = await fs.readJson(FLEET_FILE);
  const salesWithNoImage = fleet.filter(c => c.category === 'Sales' && (!c.image || c.image === ''));
  
  console.log(`Found ${salesWithNoImage.length} cars without images.`);

  // Group by brand+model to avoid duplicate downloads
  const uniqueModels = new Map();
  for (const car of salesWithNoImage) {
    // Extract clean brand and model
    const brand = car.brand;
    const model = car.model.replace(/\s*\(\d{4}\)/, ''); // Remove year from model
    const key = `${brand}_${model}`;
    if (!uniqueModels.has(key)) {
      uniqueModels.set(key, { brand, model, cars: [] });
    }
    uniqueModels.get(key).cars.push(car);
  }

  console.log(`Unique models to fetch: ${uniqueModels.size}\n`);

  for (const [key, data] of uniqueModels) {
    // Find best search query
    let query = '';
    for (const [qKey, qVal] of Object.entries(searchQueries)) {
      if (data.brand.includes(qKey) || data.model.includes(qKey.split(' ')[1] || qKey)) {
        query = qVal;
        break;
      }
    }
    if (!query) {
      query = `${data.brand.toLowerCase().replace(/\s+/g, '+')}+${data.model.toLowerCase().replace(/\s+/g, '+')}+car`;
    }

    const url = `https://source.unsplash.com/800x600/?${query}`;
    const filename = `sales-${data.brand.toLowerCase().replace(/\s+/g, '-')}-${data.model.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;
    const dest = path.join(UPLOADS_DIR, filename);
    const imgPath = `/uploads/${filename}`;

    try {
      await downloadFile(url, dest);
      console.log(`✅ ${data.brand} ${data.model} -> ${filename}`);
      
      // Update all cars with this brand/model
      for (const car of data.cars) {
        const idx = fleet.findIndex(c => c.id === car.id);
        if (idx !== -1) {
          fleet[idx].image = imgPath;
          fleet[idx].images = [imgPath];
        }
      }
      
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.log(`❌ ${data.brand} ${data.model}: ${err.message}`);
    }
  }

  await fs.writeJson(FLEET_FILE, fleet, { spaces: 2 });
  
  // Final check
  const remaining = fleet.filter(c => c.category === 'Sales' && (!c.image || c.image === ''));
  console.log(`\n✅ Done! Remaining without images: ${remaining.length}`);
}

main().catch(console.error);
