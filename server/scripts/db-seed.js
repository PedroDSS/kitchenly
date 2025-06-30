import { Umzug, SequelizeStorage } from 'umzug';
import db from '../models/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { sequelize } = db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const umzug = new Umzug({
  migrations: {
    glob: join(__dirname, '..', 'seeders', '*.js'),
    resolve: ({ name, path, context }) => {
      const migration = import(path);
      return {
        name,
        up: async (params) => (await migration).up(params),
        down: async (params) => (await migration).down(params),
      }
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, tableName: 'SequelizeData' }),
  logger: console,
});

const runSeeders = async () => {
  try {
    const action = process.argv[2];
    
    if (action === 'down') {
      console.log('Rolling back all seeders...');
      await umzug.down({ to: 0 });
      console.log('All seeders have been rolled back.');
    } else {
      console.log('Running all seeders...');
      await umzug.up();
      console.log('All seeders have been executed.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error running seeders:', error);
    process.exit(1);
  }
};

runSeeders();