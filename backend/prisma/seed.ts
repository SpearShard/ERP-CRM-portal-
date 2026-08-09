import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const password = await bcrypt.hash("Password123!", 10);

  const users = [
    {
      name: "Admin User",
      email: "admin@erp.com",
      role: "ADMIN" as const,
    },
    {
      name: "Sales User",
      email: "sales@erp.com",
      role: "SALES" as const,
    },
    {
      name: "Warehouse User",
      email: "warehouse@erp.com",
      role: "WAREHOUSE" as const,
    },
    {
      name: "Accounts User",
      email: "accounts@erp.com",
      role: "ACCOUNTS" as const,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password,
        role: user.role,
      },
    });
  }

  console.log("Seed completed successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });