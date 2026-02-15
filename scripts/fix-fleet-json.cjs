
const fs = require('fs-extra');
const path = require('path');

async function fixFleet() {
  const filePath = path.join(process.cwd(), 'data', 'fleet.json');
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    // Attempt to fix common issues if it's really messy
    // But better to just try parsing first
    try {
      const data = JSON.parse(content);
      console.log("JSON is already valid. Just re-beautifying.");
      await fs.writeJson(filePath, data, { spaces: 2 });
    } catch (e) {
      console.log("JSON is invalid. Attempting aggressive repair...");
      console.error("Original error:", e.message);
      
      // If there are rogue '+' or other characters from tool mishaps
      content = content.replace(/^\+ /gm, ''); // Remove common diff artifacts if any
      
      // Low-level regex repair for common mistakes
      // 1. Double commas
      content = content.replace(/,,/g, ',');
      // 2. Commas before closing braces
      content = content.replace(/,(\s*[\]}])/g, '$1');
      
      try {
        const data = JSON.parse(content);
        await fs.writeJson(filePath, data, { spaces: 2 });
        console.log("Successfully repaired and saved fleet.json");
      } catch (e2) {
        console.error("Deep repair failed:", e2.message);
        // Manual check of snippets around error might be needed
      }
    }
  } catch (err) {
    console.error("File access error:", err);
  }
}

fixFleet();
