const fs = require('fs');
const path = require('path');

const fleetPath = path.join(__dirname, '..', 'data', 'fleet.json');

try {
  const rawData = fs.readFileSync(fleetPath, 'utf8');
  let fleet = JSON.parse(rawData);

  fleet = fleet.map(car => {
    // 1. Clean Model: Remove (YYYY)
    let newModel = car.model.replace(/\s*\(\d{4}\)/g, '').trim();

    // 2. Clean Description
    // Remove Year at start (e.g. "2015 ")
    let newDesc = car.description.replace(/^\d{4}\s+/, '');
    
    // Remove (State Reg) e.g. (UP Reg), (DL Reg)
    newDesc = newDesc.replace(/\s*\([A-Z]{2}\s+Reg\)/g, '');
    
    // Remove "✦ CERTIFIED"
    newDesc = newDesc.replace(/\s*✦\s*CERTIFIED/g, '');

    // 3. Ensure Category is NOT "Sales" (move to "Chauffeur Driven")
    let newCategory = car.category;
    if (car.category === 'Sales') {
        newCategory = 'Chauffeur Driven';
    }

    return {
      ...car,
      model: newModel,
      description: newDesc,
      category: newCategory
    };
  });

  fs.writeFileSync(fleetPath, JSON.stringify(fleet, null, 2), 'utf8');
  console.log('Successfully cleaned fleet.json');
  console.log('Processed ' + fleet.length + ' cars.');

} catch (err) {
  console.error('Error processing fleet.json:', err);
}
