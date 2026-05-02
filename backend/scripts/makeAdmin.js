// Ejecutar con: node scripts/makeAdmin.js tu@email.com
const mongoose = require('mongoose');
require('dotenv').config();

const email = process.argv[2];
if (!email) {
  console.error('Uso: node scripts/makeAdmin.js tu@email.com');
  process.exit(1);
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await mongoose.connection.db.collection('users').findOneAndUpdate(
    { email },
    { $set: { role: 'admin' } },
    { returnDocument: 'after' }
  );

  if (!result) {
    console.log(`❌ No se encontró ningún usuario con email: ${email}`);
  } else {
    console.log(`✅ ${result.name} (${result.email}) ahora es admin.`);
  }

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
