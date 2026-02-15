const fs = require('fs');
const path = require('path');

const fleetPath = path.join(__dirname, '..', 'data', 'fleet.json');

try {
  const rawData = fs.readFileSync(fleetPath, 'utf8');
  const fleet = JSON.parse(rawData);

  const uniqueCars = [];
  const seenModels = new Set();
  let duplicatesRemoved = 0;

  fleet.forEach(car => {
    // Create a unique key based on Brand and Model (case-insensitive)
    const key = `${car.brand.toLowerCase()}-${car.model.toLowerCase()}`;
    
    if (!seenModels.has(key)) {
      seenModels.add(key);
      uniqueCars.push(car);
    } else {
      console.log(`Removing duplicate: ${car.brand} ${car.model} (ID: ${car.id})`);
      duplicatesRemoved++;
    }
  });

  fs.writeFileSync(fleetPath, JSON.stringify(uniqueCars, null, 2), 'utf8');
  console.log('Successfully deduplicated fleet.json');
  console.log(`Original count: ${fleet.length}`);
  console.log(`New count: ${uniqueCars.length}`);
  console.log(`Removed ${duplicatesRemoved} duplicates.`);

} catch (err) {
  console.error('Error processing fleet.json:', err);
}
