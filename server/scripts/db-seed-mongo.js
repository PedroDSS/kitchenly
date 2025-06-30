import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import MongoDB models
import Widget from '../models/mongo/widgetModel.js';

const seedWidgets = async () => {
  const widgets = [
    // Sales KPI Widget for Admin
    {
      displayType: 'KPI',
      timeFrame: '-1m',
      dataType: 'ca_orders',
      KPIdata: 102340,
      x: 0,
      y: 0,
      userId: '2' // Admin user
    },
    
    // Order Count Chart Widget for Admin
    {
      displayType: 'Chart',
      chartType: 'Ligne',
      timeFrame: '-6m',
      dataType: 'count_orders',
      selectedStep: 'month',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Commandes',
          data: [45, 52, 61, 58, 72, 68]
        }]
      },
      x: 1,
      y: 0,
      userId: '2' // Admin user
    },
    
    // Product Sales Chart Widget for Admin
    {
      displayType: 'Chart',
      chartType: 'Camembert',
      timeFrame: '-1m',
      dataType: 'count_products',
      selectedStep: 'day',
      data: {
        labels: ['Réfrigérateur', 'Lave-linge', 'Four', 'Aspirateur', 'Cafetière'],
        datasets: [{
          label: 'Ventes par catégorie',
          data: [25, 20, 15, 30, 10]
        }]
      },
      x: 0,
      y: 1,
      userId: '2' // Admin user
    },
    
    // User Count KPI Widget for SuperAdmin
    {
      displayType: 'KPI',
      timeFrame: '-1w',
      dataType: 'count_users',
      KPIdata: 1243,
      x: 0,
      y: 2,
      userId: '1' // SuperAdmin user
    },
    
    // Revenue Chart Widget for SuperAdmin
    {
      displayType: 'Chart',
      chartType: 'Ligne',
      timeFrame: '-1y',
      dataType: 'ca_orders',
      selectedStep: 'month',
      data: {
        labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        datasets: [{
          label: 'Chiffre d\'affaires (€)',
          data: [42000, 45000, 48000, 43000, 51000, 49000, 52000, 54000, 48000, 56000, 58000, 62000]
        }]
      },
      x: 1,
      y: 2,
      userId: '1' // SuperAdmin user
    }
  ];

  await Widget.insertMany(widgets);
  console.log('Widget seeds created successfully');
};

const seedMongoDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_CONNECTION || process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing widgets
    await Widget.deleteMany({});
    console.log('Cleared existing widgets');

    // Seed widgets
    await seedWidgets();

    console.log('MongoDB seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding MongoDB:', error);
    process.exit(1);
  }
};

seedMongoDB();