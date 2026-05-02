require('dotenv').config();
const connectDB = require('../config/db');
const ServiceCategory = require('../models/ServiceCategory');

const categories = [
  { name: 'Plomería',           slug: 'plomeria',          icon: '🔧', priceMin: 3000,  priceMax: 15000, order: 1 },
  { name: 'Electricidad',       slug: 'electricidad',      icon: '⚡', priceMin: 3000,  priceMax: 20000, order: 2 },
  { name: 'Jardinería',         slug: 'jardineria',        icon: '🌱', priceMin: 2000,  priceMax: 10000, order: 3 },
  { name: 'Corte de pasto',     slug: 'corte-pasto',       icon: '🌿', priceMin: 1500,  priceMax: 6000,  order: 4 },
  { name: 'Lavado de autos',    slug: 'lavado-autos',      icon: '🚗', priceMin: 2000,  priceMax: 8000,  order: 5 },
  { name: 'Lavandería',         slug: 'lavanderia',        icon: '👕', priceMin: 1500,  priceMax: 7000,  order: 6 },
  { name: 'Peluquería a domicilio', slug: 'peluqueria',    icon: '✂️', priceMin: 2000,  priceMax: 12000, order: 7 },
  { name: 'Mascotas',           slug: 'mascotas',          icon: '🐾', priceMin: 1500,  priceMax: 8000,  order: 8 },
  { name: 'Viajes privados',    slug: 'viajes',            icon: '🚕', priceMin: 1000,  priceMax: 20000, order: 9 },
  { name: 'Reparaciones del hogar', slug: 'reparaciones',  icon: '🏠', priceMin: 3000,  priceMax: 25000, order: 10 },
];

const seed = async () => {
  await connectDB();
  await ServiceCategory.deleteMany({});
  await ServiceCategory.insertMany(categories);
  console.log('✅ Categorías insertadas');
  process.exit(0);
};

seed();
