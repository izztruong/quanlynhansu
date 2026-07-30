import { PrismaClient } from '@prisma/client';

// passwordHash is excluded from every query by default so it can never leak
// through an API response by accident. auth.service explicitly re-includes
// it (omit: { passwordHash: false }) for the one query that needs to verify it.
export const prisma = new PrismaClient({
  omit: {
    employee: {
      passwordHash: true,
    },
  },
});
