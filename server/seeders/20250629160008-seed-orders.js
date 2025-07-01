import Orders from '../models/postgres/orderModel.js';

export const up = async ({ context: queryInterface }) => {
  const orders = [
    // Order 1 - John Doe - Samsung Refrigerator
    {
      orderUnique: 1001,
      quantity: 1,
      userId: 3,
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      address: '123 Main Street',
      country: 'France',
      city: 'Paris',
      postalCode: '75015',
      phoneNumber: '+33123456791',
      productId: 1, // Samsung refrigerator
      amount: 2899.99,
      status: 'delivered',
      paymentIntentId: 'pi_1234567890abcdef', // First payment
      trackingCode: 'FR1234567890123',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    
    // Order 2 - Jane Smith - Bosch Washing Machine
    {
      orderUnique: 1002,
      quantity: 1,
      userId: 4,
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane.smith@example.com',
      address: '456 Oak Avenue',
      country: 'France',
      city: 'Lyon',
      postalCode: '69001',
      phoneNumber: '+33123456792',
      productId: 3, // Bosch washing machine
      amount: 899.99,
      status: 'shipped',
      paymentIntentId: 'pi_2345678901bcdefg', // Second payment
      trackingCode: 'FR2345678901234',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    },
    
    // Order 3 - Jane Smith - Siemens Oven
    {
      orderUnique: 1002,
      quantity: 1,
      userId: 4,
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane.smith@example.com',
      address: '456 Oak Avenue',
      country: 'France',
      city: 'Lyon',
      postalCode: '69001',
      phoneNumber: '+33123456792',
      productId: 5, // Siemens oven
      amount: 899.99,
      status: 'shipped',
      paymentIntentId: 'pi_2345678901bcdefg', // Same payment as order 2
      trackingCode: 'FR2345678901234',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    },
    
    // Order 4 - John Doe - Dyson Vacuum
    {
      orderUnique: 1003,
      quantity: 1,
      userId: 3,
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      address: '123 Main Street',
      country: 'France',
      city: 'Paris',
      postalCode: '75015',
      phoneNumber: '+33123456791',
      productId: 7, // Dyson vacuum
      amount: 699.99,
      status: 'delivered',
      paymentIntentId: 'pi_3456789012cdefgh', // Third payment
      trackingCode: 'FR3456789012345',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    
    // Order 5 - Alice Johnson - Panasonic Microwave (pending)
    {
      orderUnique: 1004,
      quantity: 1,
      userId: 5,
      firstname: 'Alice',
      lastname: 'Johnson',
      email: 'alice.johnson@example.com',
      address: '789 Pine Road',
      country: 'France',
      city: 'Bordeaux',
      postalCode: '33000',
      phoneNumber: '+33123456793',
      productId: 6, // Panasonic microwave
      amount: 189.99,
      status: 'pending',
      paymentIntentId: 'pi_4567890123defghi', // Fourth payment (pending)
      trackingCode: 'FR3456789012345',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    
    // Order 6 - Jane Smith - De'Longhi Coffee Machine (refunded)
    {
      orderUnique: 1005,
      quantity: 1,
      userId: 4,
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane.smith@example.com',
      address: '456 Oak Avenue',
      country: 'France',
      city: 'Lyon',
      postalCode: '69001',
      phoneNumber: '+33123456792',
      productId: 10, // De'Longhi coffee machine
      amount: 999.99,
      status: 'refunded',
      paymentIntentId: 'pi_5678901234efghij', // Fifth payment (refunded)
      trackingCode: 'FR4567890123456',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    
    // Order 7 & 8 - John Doe - Multiple products in one order
    {
      orderUnique: 1006,
      quantity: 1,
      userId: 3,
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      address: '123 Main Street',
      country: 'France',
      city: 'Paris',
      postalCode: '75015',
      phoneNumber: '+33123456791',
      productId: 2, // LG refrigerator
      amount: 1999.99,
      status: 'processing',
      paymentIntentId: 'pi_6789012345fghijk', // Sixth payment
      trackingCode: 'FR7291038465127',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      orderUnique: 1006,
      quantity: 1,
      userId: 3,
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      address: '123 Main Street',
      country: 'France',
      city: 'Paris',
      postalCode: '75015',
      phoneNumber: '+33123456791',
      productId: 9, // Daikin AC
      amount: 1899.99,
      status: 'processing',
      paymentIntentId: 'pi_6789012345fghijk', // Same payment
      trackingCode: 'FR0583746291834',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  await Orders.bulkCreate(orders, { 
    individualHooks: true
  });
};

export const down = async ({ context: queryInterface }) => {
  await Orders.destroy({ where: {}, individualHooks: true });
};