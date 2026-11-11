import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../app/generated/prisma/client";
import attractions from "./data/attractions.json";

// Not lib/prisma.ts: that module imports "server-only", which only resolves inside Next.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url) });

async function main() {
  // Upsert by id so re-running the seed updates rows instead of duplicating them.
  await prisma.$transaction(
    attractions.map(({ id, createdAt, ...fields }) => {
      const data = { ...fields, createdAt: new Date(createdAt) };
      return prisma.attraction.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      });
    }),
  );
  console.log(`Seeded ${attractions.length} attractions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
