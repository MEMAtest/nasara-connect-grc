import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- PrismaClient constructor typing mismatch with global singleton pattern
export const prisma = global.prisma ?? new (PrismaClient as any)();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
