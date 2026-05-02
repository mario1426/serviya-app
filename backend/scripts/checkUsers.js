// Ejecutar con: node scripts/checkUsers.js
const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await mongoose.connection.db.collection('users')
    .find({}, { projection: { name: 1, email: 1, role: 1, firebaseUid: 1 } })
    .toArray();

  console.log('\n=== USUARIOS EN LA BASE DE DATOS ===');
  users.forEach(u => {
    console.log(`  ${u.role.toUpperCase().padEnd(8)} | ${u.email} | ${u.name}`);
  });
  console.log('====================================\n');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
