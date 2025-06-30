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
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
