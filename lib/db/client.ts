/* eslint-disable @typescript-eslint/no-explicit-any */
// Prisma types resolve after `prisma generate`

const globalForPrisma = globalThis as unknown as { prisma: any };

// Use a Proxy so the client is lazily instantiated on first actual usage
function createLazyPrisma() {
  let client: any = null;

  function getClient() {
    if (client) return client;
    if (globalForPrisma.prisma) {
      client = globalForPrisma.prisma;
      return client;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query"] : [],
    });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }
    return client;
  }

  return new Proxy({} as any, {
    get(_target, prop) {
      return getClient()[prop];
    },
  });
}

export const prisma: any = createLazyPrisma();
