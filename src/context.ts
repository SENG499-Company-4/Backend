import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

export interface Context {
  token?: string;
  prisma: PrismaClient;
}

export const context: Context = {
  prisma,
};
