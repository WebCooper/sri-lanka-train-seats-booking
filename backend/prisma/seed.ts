import 'dotenv/config';
import { auth } from '../src/auth/auth';
import { prisma } from '../lib/prisma';

async function main() {
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'AdminPassword123!';
  const adminName = process.env.INITIAL_ADMIN_NAME || 'Super Administrator';

  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' },
  });

  if (existingAdmin) {
    console.log(`[Seed] An admin user already exists (${existingAdmin.email}). Skipping initial seed.`);
    return;
  }

  console.log(`[Seed] Creating initial admin user: ${adminEmail}`);

  const createdAdmin = await auth.api.createUser({
    body: {
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      name: adminName,
      role: 'admin',
      data: {
        title: 'Mr',
        firstName: 'Super',
        lastName: 'Administrator',
        position: 'Chief Systems Administrator',
      },
    },
  });

  console.log(`[Seed] Initial admin user created successfully! ID: ${createdAdmin.user.id}`);
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
