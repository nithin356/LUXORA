/**
 * Bulk Add Sales Inventory Script
 * Downloads car images and populates fleet.json
 */
import fs from 'fs-extra';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const UPLOADS_DIR = path.join(ROOT, 'uploads');
const FLEET_FILE = path.join(ROOT, 'data', 'fleet.json');

// Car inventory from the user's list
const cars = [
  { year: 2014, brand: "Range Rover", model: "Evoque", reg: "UP", certified: false },
  { year: 2015, brand: "Volvo", model: "XC60", reg: "DL", certified: false },
  { year: 2018, brand: "Mercedes-Benz", model: "GLA", reg: "GL", certified: false },
  { year: 2015, brand: "Audi", model: "A6 Matrix", reg: "DL", certified: false },
  { year: 2011, brand: "Jaguar", model: "XFS", reg: "DL", certified: false },
  { year: 2011, brand: "BMW", model: "X6", reg: "UP", certified: false },
  { year: 2011, brand: "Jaguar", model: "XFS", reg: "KA", certified: false },
  { year: 2012, brand: "Mercedes-Benz", model: "C200", reg: "MH", certified: true },
  { year: 2012, brand: "Audi", model: "A4", reg: "HR", certified: false },
  { year: 2013, brand: "BMW", model: "X6", reg: "HR", certified: true },
  { year: 2013, brand: "Land Rover", model: "Freelander 2", reg: "DL", certified: true },
  { year: 2014, brand: "Range Rover", model: "Evoque", reg: "UP", certified: false },
  { year: 2013, brand: "Porsche", model: "Cayenne", reg: "UP", certified: true },
  { year: 2015, brand: "Audi", model: "Q7", reg: "UP", certified: false },
  { year: 2013, brand: "BMW", model: "730LD", reg: "WB", certified: false },
  { year: 2011, brand: "Jaguar", model: "XFS", reg: "DL", certified: false },
  { year: 2012, brand: "BMW", model: "520D", reg: "UK", certified: false },
  { year: 2011, brand: "BMW", model: "530D", reg: "HR", certified: true },
  { year: 2010, brand: "BMW", model: "530D", reg: "DL", certified: true },
  { year: 2009, brand: "BMW", model: "730LD", reg: "HR", certified: false },
  { year: 2012, brand: "Audi", model: "S6", reg: "UK", certified: true },
  { year: 2016, brand: "Aston Martin", model: "Vantage", reg: "", certified: false },
  { year: 2012, brand: "BMW", model: "X3", reg: "DL", certified: true },
  { year: 2014, brand: "Range Rover", model: "Evoque", reg: "HR", certified: false },
  { year: 2012, brand: "Audi", model: "Q3", reg: "DL", certified: true },
  { year: 2011, brand: "BMW", model: "520D", reg: "DL", certified: false },
  { year: 2012, brand: "Mercedes-Benz", model: "GL350", reg: "HR", certified: false, extra: "5 Seater" },
  { year: 2012, brand: "BMW", model: "520D", reg: "DL", certified: true },
  { year: 2015, brand: "Range Rover", model: "Evoque", reg: "DL", certified: true },
  { year: 2012, brand: "Mercedes-Benz", model: "C200 Petrol", reg: "MH", certified: false },
  { year: 2012, brand: "BMW", model: "X3", reg: "DL", certified: true },
];

// Map of brand+model to image search queries for free stock images
const imageUrls = {
  "Range Rover_Evoque": "https://cdn.pixabay.com/photo/2017/03/27/14/56/auto-2178220_640.jpg",
  "Volvo_XC60": "https://cdn.pixabay.com/photo/2016/12/03/18/57/car-1880381_640.jpg",
  "Mercedes-Benz_GLA": "https://cdn.pixabay.com/photo/2016/04/01/12/16/car-1300629_640.png",
  "Audi_A6 Matrix": "https://cdn.pixabay.com/photo/2019/03/27/21/18/audi-4086436_640.jpg",
  "Jaguar_XFS": "https://cdn.pixabay.com/photo/2014/09/07/16/53/jag-438049_640.jpg",
  "BMW_X6": "https://cdn.pixabay.com/photo/2016/09/07/10/10/bmw-1651604_640.jpg",
  "Mercedes-Benz_C200": "https://cdn.pixabay.com/photo/2012/11/02/13/02/car-63930_640.jpg",
  "Mercedes-Benz_C200 Petrol": "https://cdn.pixabay.com/photo/2012/11/02/13/02/car-63930_640.jpg",
  "Audi_A4": "https://cdn.pixabay.com/photo/2019/03/27/21/18/audi-4086436_640.jpg",
  "BMW_X3": "https://cdn.pixabay.com/photo/2016/09/07/10/10/bmw-1651604_640.jpg",
  "Land Rover_Freelander 2": "https://cdn.pixabay.com/photo/2017/03/27/14/56/auto-2178220_640.jpg",
  "Porsche_Cayenne": "https://cdn.pixabay.com/photo/2017/12/14/17/29/porsche-3019542_640.jpg",
  "Audi_Q7": "https://cdn.pixabay.com/photo/2019/03/27/21/18/audi-4086436_640.jpg",
  "BMW_730LD": "https://cdn.pixabay.com/photo/2017/08/31/05/47/bmw-2699538_640.jpg",
  "BMW_520D": "https://cdn.pixabay.com/photo/2017/08/31/05/47/bmw-2699538_640.jpg",
  "BMW_530D": "https://cdn.pixabay.com/photo/2017/08/31/05/47/bmw-2699538_640.jpg",
  "Audi_S6": "https://cdn.pixabay.com/photo/2019/03/27/21/18/audi-4086436_640.jpg",
  "Aston Martin_Vantage": "https://cdn.pixabay.com/photo/2015/01/19/13/51/car-604019_640.jpg",
  "Audi_Q3": "https://cdn.pixabay.com/photo/2019/03/27/21/18/audi-4086436_640.jpg",
  "Mercedes-Benz_GL350": "https://cdn.pixabay.com/photo/2016/04/01/12/16/car-1300629_640.png",
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(dest);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

// Descriptions for each brand
const descriptions = {
  "Range Rover": "Iconic British luxury SUV with commanding road presence and refined off-road capability.",
  "Volvo": "Swedish engineering excellence with industry-leading safety and Scandinavian luxury.",
  "Mercedes-Benz": "The pinnacle of German automotive engineering, blending luxury with performance.",
  "Audi": "Progressive luxury with Quattro all-wheel drive and cutting-edge technology.",
  "Jaguar": "British sporting elegance with a heritage of performance and refined craftsmanship.",
  "BMW": "The ultimate driving machine, combining dynamic performance with premium luxury.",
  "Land Rover": "Legendary capability meets refined luxury for the ultimate adventure vehicle.",
  "Porsche": "Uncompromising performance and engineering perfection from Stuttgart.",
  "Aston Martin": "Handcrafted British grand tourer with breathtaking design and exhilarating performance.",
};

// Features for each brand
const features = {
  "Range Rover": ["Terrain Response", "Panoramic Roof", "Meridian Audio", "Leather Interior"],
  "Volvo": ["City Safety", "Sensus Navigation", "Harman Kardon Audio", "Leather Seats"],
  "Mercedes-Benz": ["COMAND System", "Burmester Audio", "Air Suspension", "Leather Interior"],
  "Audi": ["Quattro AWD", "MMI Navigation", "Bang & Olufsen Audio", "S-Line Package"],
  "Jaguar": ["InControl Touch", "Meridian Audio", "Sport Suspension", "Leather Interior"],
  "BMW": ["iDrive System", "Harman Kardon Audio", "M Sport Package", "Leather Interior"],
  "Land Rover": ["Terrain Response", "Panoramic Roof", "Meridian Audio", "All-Terrain"],
  "Porsche": ["Sport Chrono Package", "BOSE Audio", "PASM Suspension", "Full Leather"],
  "Aston Martin": ["Sports Exhaust", "Bang & Olufsen Audio", "Carbon Fibre", "Hand-Stitched Leather"],
};

function getCarType(brand, model) {
  const suvModels = ["Evoque", "XC60", "GLA", "X6", "Freelander 2", "Cayenne", "Q7", "X3", "Q3", "GL350"];
  if (suvModels.some(s => model.includes(s))) return "SUV";
  if (brand === "Aston Martin") return "Luxury";
  return "Sedan";
}

function getSeats(model) {
  if (model.includes("GL350")) return 5;
  if (model.includes("X6") || model.includes("Q7") || model.includes("Cayenne")) return 5;
  if (model.includes("Evoque") || model.includes("XC60") || model.includes("X3") || model.includes("Q3") || model.includes("GLA") || model.includes("Freelander")) return 5;
  return 4;
}

async function main() {
  console.log("🚀 Starting Bulk Sales Inventory Import...\n");

  await fs.ensureDir(UPLOADS_DIR);

  // Read existing fleet
  let fleet = [];
  try {
    fleet = await fs.readJson(FLEET_FILE);
  } catch (e) {
    fleet = [];
  }

  const newCars = [];
  const downloadedImages = {};

  // Download unique images
  console.log("📸 Downloading car images...");
  for (const car of cars) {
    const key = `${car.brand}_${car.model}`;
    if (!downloadedImages[key]) {
      const url = imageUrls[key];
      if (url) {
        const ext = path.extname(new URL(url).pathname) || '.jpg';
        const filename = `sales-${car.brand.toLowerCase().replace(/\s+/g, '-')}-${car.model.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}${ext}`;
        const dest = path.join(UPLOADS_DIR, filename);
        try {
          await downloadFile(url, dest);
          downloadedImages[key] = `/uploads/${filename}`;
          console.log(`  ✅ ${car.brand} ${car.model}`);
          // Small delay to avoid rate limiting
          await new Promise(r => setTimeout(r, 300));
        } catch (err) {
          console.log(`  ❌ ${car.brand} ${car.model}: ${err.message}`);
          downloadedImages[key] = ''; // No image
        }
      } else {
        downloadedImages[key] = '';
      }
    }
  }

  console.log("\n📝 Creating inventory entries...");
  for (const car of cars) {
    const key = `${car.brand}_${car.model}`;
    const imageUrl = downloadedImages[key] || '';
    const regLabel = car.reg ? ` (${car.reg} Reg)` : '';
    const certLabel = car.certified ? ' ✦ CERTIFIED' : '';
    const extraLabel = car.extra ? ` - ${car.extra}` : '';

    const newCar = {
      id: `${car.brand.toLowerCase().replace(/\s+/g, '-')}-${car.model.toLowerCase().replace(/\s+/g, '-')}-${car.year}-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      brand: car.brand,
      model: `${car.model} (${car.year})`,
      type: getCarType(car.brand, car.model),
      category: "Sales",
      fleetTier: car.certified ? "Platinum" : "Normal",
      seats: getSeats(car.model),
      image: imageUrl,
      images: imageUrl ? [imageUrl] : [],
      pricePerHour: 0, // Sales don't use hourly pricing
      description: `${car.year} ${car.brand} ${car.model}${regLabel}${extraLabel}${certLabel}. ${descriptions[car.brand] || 'Premium luxury vehicle.'}`,
      features: features[car.brand] || ["Leather Interior", "Premium Audio", "Climate Control", "Alloy Wheels"],
      vipOptions: {
        bodyguard: false,
        personalConcierge: false,
        premiumRefreshments: false,
        customRoute: false,
      }
    };

    newCars.push(newCar);
    console.log(`  ✅ ${car.year} ${car.brand} ${car.model}${regLabel}${certLabel}`);
  }

  // Append to fleet
  fleet.push(...newCars);
  await fs.writeJson(FLEET_FILE, fleet, { spaces: 2 });

  console.log(`\n🎉 SUCCESS! Added ${newCars.length} vehicles to Sales inventory.`);
  console.log(`   Total fleet size: ${fleet.length}`);
  console.log(`   Images downloaded: ${Object.keys(downloadedImages).length}`);
}

main().catch(console.error);
