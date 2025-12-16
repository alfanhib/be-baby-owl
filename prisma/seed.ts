import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

interface SeedUser {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

const seedUsers: SeedUser[] = [
  {
    email: 'superadmin@inntexia.com',
    password: 'SuperAdmin123!',
    fullName: 'Super Admin',
    role: UserRole.super_admin,
  },
  {
    email: 'staff@inntexia.com',
    password: 'Staff123!',
    fullName: 'Staff Member',
    role: UserRole.staff,
  },
  {
    email: 'instructor@inntexia.com',
    password: 'Instructor123!',
    fullName: 'John Instructor',
    role: UserRole.instructor,
  },
  {
    email: 'student@inntexia.com',
    password: 'Student123!',
    fullName: 'Jane Student',
    role: UserRole.student,
  },
];

async function main() {
  console.log('🌱 Seeding database...\n');

  for (const userData of seedUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`⏭️  User ${userData.email} already exists, skipping...`);
      continue;
    }

    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        fullName: userData.fullName,
        role: userData.role,
        status: UserStatus.active,
        emailVerified: true,
        onboardingCompleted: true,
      },
    });

    console.log(`✅ Created ${userData.role}: ${user.email}`);
  }

  console.log('\n🎉 Seed completed!\n');
  console.log('📋 Test Credentials:');
  console.log('─'.repeat(50));
  seedUsers.forEach((u) => {
    console.log(`   ${u.role.padEnd(12)} | ${u.email} | ${u.password}`);
  });
  console.log('─'.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
