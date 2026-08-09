import { Request, Response } from "express";
import prisma from "../config/database";

export async function createProduct(
  req: Request,
  res: Response
) {
  try {
    const {
      name,
      sku,
      category,
      unitPrice,
      currentStock,
      minimumStock,
      warehouse,
    } = req.body;

    if (
      !name ||
      !sku ||
      !category ||
      unitPrice === undefined ||
      !warehouse
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, SKU, category, unit price, and warehouse are required",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        sku,
      },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with this SKU already exists",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        unitPrice,
        currentStock: currentStock ?? 0,
        minimumStock: minimumStock ?? 0,
        warehouse,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getProducts(
  req: Request,
  res: Response
) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const category =
      typeof req.query.category === "string"
        ? req.query.category.trim()
        : "";

    const where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (category) {
      where.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.product.count({
        where,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getProductById(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateProduct(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const {
      name,
      sku,
      category,
      unitPrice,
      minimumStock,
      warehouse,
    } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // If SKU is being changed, make sure it isn't already used
    if (sku && sku !== existingProduct.sku) {
      const productWithSku = await prisma.product.findUnique({
        where: {
          sku,
        },
      });

      if (productWithSku) {
        return res.status(409).json({
          success: false,
          message: "A product with this SKU already exists",
        });
      }
    }

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(sku !== undefined && { sku }),
        ...(category !== undefined && { category }),
        ...(unitPrice !== undefined && { unitPrice }),
        ...(minimumStock !== undefined && { minimumStock }),
        ...(warehouse !== undefined && { warehouse }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}