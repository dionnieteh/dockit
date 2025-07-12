const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('changeme123', 10); // 🔒 Secure password

  // 🧑‍💼 Create or update admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dockit.app' }, // change if needed
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@dockit.app',
      password: hashedPassword,
      role: 'ADMIN',
      institution: 'DockIt Organization',
      purpose: 'Admin access and platform maintenance',
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // Define default parameters
  await prisma.defaultParameters.upsert({
    where: { id: 1 },
    update: {
      gridSizeX: '30',
      gridSizeY: '30',
      gridSizeZ: '30',
      centerX: '17.1299',
      centerY: '-4.8141',
      centerZ: '38.9618',
      numModes: '10',
      energyRange: '4',
      verbosity: '1',
      exhaustiveness: '8',
      updatedBy: admin.id,
    },
    create: {
      id: 1,
      gridSizeX: '30',
      gridSizeY: '30',
      gridSizeZ: '30',
      centerX: '17.1299',
      centerY: '-4.8141',
      centerZ: '38.9618',
      numModes: '10',
      energyRange: '4',
      verbosity: '1',
      exhaustiveness: '8',
      updatedBy: admin.id,
    },
  });

  console.log(`✅ Default docking parameters seeded.`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
