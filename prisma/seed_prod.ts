import { PrismaClient, Role } from '@prisma/client';
import { randomNumber } from '../src/utils/helpers';
import userData from './static/users.json';
const prisma = new PrismaClient();

async function main() {
  if ((await prisma.user.count()) === 0) {
    for (const userObj of userData) {
      await (prisma as PrismaClient).user.create({
        data: {
          name: userObj.name,
          username: userObj.username,
          password: userObj.password,
          role: userObj.role as Role,
          peng: randomNumber(8) > 4,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
