import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import prisma from "../config/database.js";


type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];


export async function createStockMovement(
  req: AuthRequest,
  res: Response
) {
  try {
    const productId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

  if (!productId) {
  return res.status(400).json({
    success: false,
    message: "Product ID is required",
  });
}
    const { quantity, type, reason } = req.body;

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    if (type !== "IN" && type !== "OUT") {
      return res.status(400).json({
        success: false,
        message: "Type must be IN or OUT",
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
      });
    }

    const result = await prisma.$transaction(
  async (tx: TransactionClient) => {
      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (type === "OUT" && product.currentStock < quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      const newStock =
        type === "IN"
          ? product.currentStock + quantity
          : product.currentStock - quantity;

      const updatedProduct = await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          currentStock: newStock,
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity,
          type,
          reason: reason.trim(),
          createdById: userId,
        },
      });

      return {
        product: updatedProduct,
        movement,
      };
    });

    return res.status(201).json({
      success: true,
      message: "Stock movement created successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (error.message === "INSUFFICIENT_STOCK") {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
        });
      }
    }

    console.error("Create stock movement error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getProductStockMovements(
  req: Request,
  res: Response
) {
  try {
    const productId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

if (!productId) {
  return res.status(400).json({
    success: false,
    message: "Product ID is required",
  });
}

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const movements = await prisma.stockMovement.findMany({
      where: {
        productId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        movements,
      },
    });
  } catch (error) {
    console.error("Get stock movements error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}