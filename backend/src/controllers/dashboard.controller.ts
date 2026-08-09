import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function getDashboardStats(
  _req: Request,
  res: Response
) {
  try {
    const [customers, products, challans, productStock] =
      await Promise.all([
        prisma.customer.count(),
        prisma.product.count(),
        prisma.challan.count(),
        prisma.product.findMany({
          select: {
            currentStock: true,
            minimumStock: true,
          },
        }),
      ]);

    const lowStock = productStock.filter(
  (product: {
    currentStock: number;
    minimumStock: number;
  }) => product.currentStock <= product.minimumStock
).length;

    return res.json({
      success: true,
      data: {
        customers,
        products,
        lowStock,
        challans,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
}