import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

// Enable query logging
prisma.$on("query", (e: { query: string; params: string; duration: number }) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Query:", e.query);
    console.log("Params:", e.params);
    console.log("Duration:", e.duration + "ms");
  }

  // Optionally send to external logging services
});

// Ensure connection is closed on app termination
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
