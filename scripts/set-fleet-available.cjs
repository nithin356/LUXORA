
const fs = require('fs-extra');
const path = require('path');

async function fixAvailability() {
  const filePath = path.join(process.cwd(), 'data', 'fleet.json');
  try {
    const data = await fs.readJson(filePath);
    const updatedData = data.map(car => ({
      ...car,
      status: 'Available'
    }));
    await fs.writeJson(filePath, updatedData, { spaces: 2 });
    console.log(`Successfully added 'Available' status to ${updatedData.length} cars.`);
  } catch (err) {
    console.error("Error updating fleet availability:", err);
  }
}

fixAvailability();
