import Users from '../models/postgres/userModel.js';

export const up = async ({ context: queryInterface }) => {
  const plainPassword = 'Password1234!';
  
  const users = [
    {
      firstname: 'Super',
      lastname: 'Admin',
      email: 'superadmin@kitchenly.com',
      password: plainPassword,
      role: 'SuperAdmin',
      isVerified: true,
      address: '1 rue de la Paix',
      country: 'France',
      phoneNumber: '+33123456789',
      postalCode: '75001',
      city: 'Paris',
      acceptLegal: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@kitchenly.com',
      password: plainPassword,
      role: 'Admin',
      isVerified: true,
      address: '2 avenue des Champs',
      country: 'France',
      phoneNumber: '+33123456790',
      postalCode: '75008',
      city: 'Paris',
      acceptLegal: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      password: plainPassword,
      role: 'User',
      isVerified: true,
      address: '123 Main Street',
      country: 'France',
      phoneNumber: '+33123456791',
      postalCode: '75015',
      city: 'Paris',
      acceptLegal: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane.smith@example.com',
      password: plainPassword,
      role: 'User',
      isVerified: true,
      address: '456 Oak Avenue',
      country: 'France',
      phoneNumber: '+33123456792',
      postalCode: '69001',
      city: 'Lyon',
      acceptLegal: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      firstname: 'Alice',
      lastname: 'Johnson',
      email: 'alice.johnson@example.com',
      password: plainPassword,
      role: 'User',
      isVerified: false,
      address: '789 Pine Road',
      country: 'France',
      phoneNumber: '+33123456793',
      postalCode: '33000',
      city: 'Bordeaux',
      acceptLegal: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await Users.bulkCreate(users, { 
    individualHooks: true
  });
};

export const down = async ({ context: queryInterface }) => {
  await Users.destroy({ where: {}, individualHooks: true });
};