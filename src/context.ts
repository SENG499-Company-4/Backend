import { PrismaClient } from '@prisma/client';
import { getUserId } from './utils/auth';
export const prisma = new PrismaClient();

// Authentication class
export class AuthSource {
  constructor(protected prisma: PrismaClient) {}

  async isValidUser(token: string | undefined): Promise<boolean> {
    if (!token) return false;
    const exists = await (prisma as PrismaClient).user.findUnique({
      where: {
        id: getUserId(token),
      },
    });
    return !!exists;
  }

  async isAdmin(token: string | undefined): Promise<boolean> {
    if (!token) return false;
    const user = await (prisma as PrismaClient).user.findUnique({
      where: {
        id: getUserId(token),
      },
    });
    return user?.role == 'ADMIN';
  }

  async isCurrentUser(token: string | undefined, id: number): Promise<boolean> {
    if (!token) return false;
    const user = await (prisma as PrismaClient).user.findUnique({
      where: {
        id: getUserId(token),
      },
    });
    return user?.id == id;
  }
}

export interface Context {
  token?: string;
  prisma: PrismaClient;
  auth: AuthSource;
}


export const context: Context = {
  prisma,
  auth: new AuthSource(prisma),
};
