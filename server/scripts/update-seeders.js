import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedersDir = path.join(__dirname, '..', 'seeders');

// Get all seeder files
const seederFiles = fs.readdirSync(seedersDir).filter(file => file.endsWith('.js'));

seederFiles.forEach(file => {
  if (file === '20250629160001-seed-users.js') return; // Skip the one we already updated
  
  const filePath = path.join(seedersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import statement if not present
  if (!content.includes("import db from '../models/index.js';")) {
    content = content.replace(
      /export const up/,
      `import db from '../models/index.js';\n\nexport const up`
    );
  }
  
  // Update up function
  content = content.replace(
    /export const up = async \(queryInterface, Sequelize\) => {/,
    `export const up = async ({ context: queryInterface }) => {\n  const { sequelize } = db;`
  );
  
  // Update down function
  content = content.replace(
    /export const down = async \(queryInterface, Sequelize\) => {/,
    `export const down = async ({ context: queryInterface }) => {\n  const { sequelize } = db;`
  );
  
  // Update bulkInsert calls
  content = content.replace(
    /await queryInterface\.bulkInsert\(/g,
    'await sequelize.getQueryInterface().bulkInsert('
  );
  
  // Update bulkDelete calls
  content = content.replace(
    /await queryInterface\.bulkDelete\(/g,
    'await sequelize.getQueryInterface().bulkDelete('
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});

console.log('All seeders updated!');