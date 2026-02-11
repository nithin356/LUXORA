
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Paths
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const FLEET_FILE = path.join(DATA_DIR, 'fleet.json');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');

// Memory lock to prevent race conditions during file operations
const fileLocks = new Set();
async function acquireLock(fileName) {
  while (fileLocks.has(fileName)) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  fileLocks.add(fileName);
}
function releaseLock(fileName) {
  fileLocks.delete(fileName);
}

async function safeReadJson(filePath, defaultValue = []) {
  try {
    if (!await fs.pathExists(filePath)) return defaultValue;
    
    // Retry reading if file size is 0 (likely being written to)
    for (let i = 0; i < 5; i++) {
      const stats = await fs.stat(filePath);
      if (stats.size > 0) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return await fs.readJson(filePath);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

async function safeWriteJson(filePath, data) {
  const fileName = path.basename(filePath);
  await acquireLock(fileName);
  try {
    const tempPath = `${filePath}.tmp`;
    await fs.writeJson(tempPath, data);
    await fs.move(tempPath, filePath, { overwrite: true });
  } finally {
    releaseLock(fileName);
  }
}

async function initServer() {
  try {
    // Ensure directories and files exist
    await fs.ensureDir(DATA_DIR);
    await fs.ensureDir(UPLOADS_DIR);
    
    if (!await fs.pathExists(FLEET_FILE)) {
      await fs.writeJson(FLEET_FILE, []);
    }
    if (!await fs.pathExists(ENQUIRIES_FILE)) {
      await fs.writeJson(ENQUIRIES_FILE, []);
    }

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use('/uploads', express.static(UPLOADS_DIR));

    // Multer storage config
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
    const upload = multer({ storage });

    // API Routes - Fleet
    app.get('/api/fleet', async (req, res) => {
      const fleet = await safeReadJson(FLEET_FILE);
      res.json(fleet);
    });

    app.post('/api/fleet', upload.array('imageFiles', 10), async (req, res) => {
      try {
        const fleet = await safeReadJson(FLEET_FILE);
        if (!req.body.carData) {
          return res.status(400).json({ error: 'Missing carData in request' });
        }
        const carData = JSON.parse(req.body.carData);
        
        let imageUrls = carData.images || [];
        if (req.files && req.files.length > 0) {
          const uploadedUrls = req.files.map(file => `/uploads/${file.filename}`);
          imageUrls = [...imageUrls, ...uploadedUrls];
        }

        const newCar = {
          ...carData,
          id: `${carData.brand.toLowerCase().replace(/\s+/g, '-')}-${carData.model.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          image: imageUrls[0] || carData.image || '',
          images: imageUrls
        };

        fleet.push(newCar);
        await safeWriteJson(FLEET_FILE, fleet);
        res.status(201).json(newCar);
      } catch (error) {
        console.error('Error saving car:', error);
        res.status(500).json({ error: 'Failed to save car' });
      }
    });

    app.put('/api/fleet/:id', upload.array('imageFiles', 10), async (req, res) => {
      try {
        const fleet = await safeReadJson(FLEET_FILE);
        if (!req.body.carData) {
          return res.status(400).json({ error: 'Missing carData in request' });
        }
        const carData = JSON.parse(req.body.carData);
        const index = fleet.findIndex(c => c.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Car not found' });

        let imageUrls = carData.images || [];
        if (req.files && req.files.length > 0) {
          const uploadedUrls = req.files.map(file => `/uploads/${file.filename}`);
          imageUrls = [...imageUrls, ...uploadedUrls];
        }

        const existingCar = fleet[index];
        const mergedCar = { 
          ...existingCar, 
          ...carData, 
          id: existingCar.id, // Absolute ID safety
          category: carData.category || existingCar.category,
          image: (imageUrls && imageUrls.length > 0) ? imageUrls[0] : (carData.image || existingCar.image),
          images: (imageUrls && imageUrls.length > 0) ? imageUrls : (carData.images || existingCar.images || [])
        };

        fleet[index] = mergedCar;
        await safeWriteJson(FLEET_FILE, fleet);
        res.json(mergedCar);
      } catch (error) {
        console.error('Error updating car:', error);
        res.status(500).json({ error: 'Failed to update car' });
      }
    });

    app.delete('/api/fleet/:id', async (req, res) => {
      try {
        const fleet = await safeReadJson(FLEET_FILE);
        const updatedFleet = fleet.filter(c => c.id !== req.params.id);
        await safeWriteJson(FLEET_FILE, updatedFleet);
        res.status(204).send();
      } catch (err) {
        console.error('Error deleting car:', err);
        res.status(500).json({ error: 'Failed to delete car' });
      }
    });

    // API Routes - Enquiries
    app.get('/api/enquiries', async (req, res) => {
      const enquiries = await safeReadJson(ENQUIRIES_FILE);
      res.json(enquiries);
    });

    app.post('/api/enquiries', async (req, res) => {
      try {
        const enquiries = await safeReadJson(ENQUIRIES_FILE);
        const newEnquiry = {
          ...req.body,
          id: `enq-${Date.now()}`,
          status: 'pending',
          timestamp: Date.now()
        };
        enquiries.push(newEnquiry);
        await safeWriteJson(ENQUIRIES_FILE, enquiries);
        res.status(201).json(newEnquiry);
      } catch (err) {
        console.error('Error saving enquiry:', err);
        res.status(500).json({ error: 'Failed to save enquiry' });
      }
    });

    app.patch('/api/enquiries/:id', async (req, res) => {
      try {
        const enquiries = await safeReadJson(ENQUIRIES_FILE);
        const index = enquiries.findIndex(e => e.id === req.params.id);
        if (index !== -1) {
          enquiries[index] = { ...enquiries[index], ...req.body };
          await safeWriteJson(ENQUIRIES_FILE, enquiries);
          res.json(enquiries[index]);
        } else {
          res.status(404).send();
        }
      } catch (err) {
        console.error('Error updating enquiry:', err);
        res.status(500).json({ error: 'Failed to update enquiry' });
      }
    });

    app.delete('/api/enquiries/:id', async (req, res) => {
      try {
        const enquiries = await safeReadJson(ENQUIRIES_FILE);
        const updatedEnquiries = enquiries.filter(e => e.id !== req.params.id);
        await safeWriteJson(ENQUIRIES_FILE, updatedEnquiries);
        res.status(204).send();
      } catch (err) {
        console.error('Error deleting enquiry:', err);
        res.status(500).json({ error: 'Failed to delete enquiry' });
      }
    });

    // Serve static files from the build directory
    const DIST_DIR = path.join(__dirname, 'dist');
    const PUBLIC_DIR = path.join(__dirname, 'public');
    app.use(express.static(DIST_DIR));
    app.use(express.static(PUBLIC_DIR));
    app.use(express.static(__dirname)); // Fallback for root assets

    // Reset Fleet
    app.post('/api/fleet/reset', async (req, res) => {
        try {
          await fs.writeJson(FLEET_FILE, []);
          res.status(200).send({ message: 'Fleet cleared' });
        } catch (err) {
          res.status(500).send();
        }
    });

    // Catch-all route for SPA - MUST BE LAST
    app.get('*', (req, res) => {
      // If it's an API request that wasn't caught, return 404
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      // Otherwise serve index.html
      const indexPath = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Frontend not built. Please run npm run build.');
      }
    });

    app.listen(PORT, () => {
      console.log(`Luxora Global Backend running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('SERVER INIT CRITICAL ERROR:', err);
  }
}

initServer();
