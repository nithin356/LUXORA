
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'fleet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const tiers = {};
data.forEach(car => {
  const tier = car.fleetTier || 'Unknown';
  tiers[tier] = (tiers[tier] || 0) + 1;
});

console.log('Tier distribution:', tiers);
