import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware.js";

export async function createChallan(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      customerId,
      items,
    } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product is required",
      });
    }

    // Check customer
    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Validate item structure
    for (const item of items) {
      if (
        !item.productId ||
        !item.quantity ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each item must contain a valid productId and quantity",
        });
      }
    }

    // Get all requested products
    const productIds = items.map(
      (item: { productId: string }) => item.productId
    );

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    // Make sure every product exists
    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more products not found",
      });
    }

    // Generate challan number
    const challanNumber = `CH-${Date.now()}`;

    // Create challan with product snapshots
    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        createdById: userId,
        status: "DRAFT",
        totalQuantity: items.reduce(
          (total: number, item: { quantity: number }) =>
            total + item.quantity,
          0
        ),
        items: {
          create: items.map(
            (item: {
              productId: string;
              quantity: number;
            }) => {
              const product = products.find(
                (p) => p.id === item.productId
              )!;

              return {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                unitPrice: product.unitPrice,
                quantity: item.quantity,
              };
            }
          ),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Challan created successfully",
      data: {
        challan,
      },
    });
  } catch (error) {
    console.error("Create challan error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function confirmChallan(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const challanId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!challanId) {
      return res.status(400).json({
        success: false,
        message: "Challan ID is required",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: {
          id: challanId,
        },
        include: {
          items: true,
        },
      });

      if (!challan) {
        throw new Error("CHALLAN_NOT_FOUND");
      }

      if (challan.status !== "DRAFT") {
        throw new Error("CHALLAN_NOT_DRAFT");
      }

      if (challan.items.length === 0) {
        throw new Error("CHALLAN_EMPTY");
      }

      // Check stock for every item first
      for (const item of challan.items) {
        const product = await tx.product.findUnique({
          where: {
            id: item.productId,
          },
        });

        if (!product) {
          throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
        }

        if (product.currentStock < item.quantity) {
          throw new Error(
            `INSUFFICIENT_STOCK:${product.name}`
          );
        }
      }

      // Deduct stock and create OUT movements
      for (const item of challan.items) {
        const product = await tx.product.findUnique({
          where: {
            id: item.productId,
          },
        });

        if (!product) {
          throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
        }

        await tx.product.update({
          where: {
            id: product.id,
          },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: item.quantity,
            type: "OUT",
            reason: `Sales challan ${challan.challanNumber}`,
            createdById: userId,
          },
        });
      }

      // Confirm challan
      const confirmedChallan = await tx.challan.update({
        where: {
          id: challan.id,
        },
        data: {
          status: "CONFIRMED",
        },
        include: {
          customer: true,
          items: true,
        },
      });

      return confirmedChallan;
    });

    return res.status(200).json({
      success: true,
      message: "Challan confirmed successfully",
      data: {
        challan: result,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "CHALLAN_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Challan not found",
        });
      }

      if (error.message === "CHALLAN_NOT_DRAFT") {
        return res.status(400).json({
          success: false,
          message: "Only draft challans can be confirmed",
        });
      }

      if (error.message === "CHALLAN_EMPTY") {
        return res.status(400).json({
          success: false,
          message: "Cannot confirm an empty challan",
        });
      }

      if (error.message.startsWith("PRODUCT_NOT_FOUND:")) {
        return res.status(404).json({
          success: false,
          message: "One or more products were not found",
        });
      }

      if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
        const productName = error.message.split(":")[1];

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${productName}`,
        });
      }
    }

    console.error("Confirm challan error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getChallans(
  req: AuthRequest,
  res: Response
) {
  try {
    const challans = await prisma.challan.findMany({
      include: {
        customer: true,
        items: true,
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
        challans,
      },
    });
  } catch (error) {
    console.error("Get challans error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getChallanById(
  req: AuthRequest,
  res: Response
) {
  try {
    const challanId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!challanId) {
      return res.status(400).json({
        success: false,
        message: "Challan ID is required",
      });
    }

    const challan = await prisma.challan.findUnique({
      where: {
        id: challanId,
      },
      include: {
        customer: true,
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        challan,
      },
    });
  } catch (error) {
    console.error("Get challan error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function cancelChallan(
  req: AuthRequest,
  res: Response
) {
  try {
    const challanId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!challanId) {
      return res.status(400).json({
        success: false,
        message: "Challan ID is required",
      });
    }

    const challan = await prisma.challan.findUnique({
      where: {
        id: challanId,
      },
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    if (challan.status === "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message:
          "Confirmed challans cannot be cancelled",
      });
    }

    if (challan.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Challan is already cancelled",
      });
    }

    const cancelledChallan = await prisma.challan.update({
      where: {
        id: challanId,
      },
      data: {
        status: "CANCELLED",
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Challan cancelled successfully",
      data: {
        challan: cancelledChallan,
      },
    });
  } catch (error) {
    console.error("Cancel challan error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}