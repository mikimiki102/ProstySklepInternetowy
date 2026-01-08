import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@test.pl';
  const password = 'admin1234';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { name: 'Admin', passwordHash, role: Role.ADMIN },
    create: { email, name: 'Admin', passwordHash, role: Role.ADMIN },
  });

  console.log('ADMIN seeded:', email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
