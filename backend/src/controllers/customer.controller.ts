import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";

export async function createCustomer(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      type,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    if (
      !name ||
      !mobile ||
      !businessName ||
      !type ||
      !address ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message: "Required customer fields are missing",
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber,
        type,
        address,
        status,
        followUpDate: followUpDate
          ? new Date(followUpDate)
          : null,
        notes,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("Create customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getCustomers(
  req: AuthRequest,
  res: Response
) {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        customers,
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getCustomerById(
  req: AuthRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("Get customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateCustomer(
  req: AuthRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      type,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = await prisma.customer.update({
      where: {
        id,
      },
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber,
        type,
        address,
        status,
        followUpDate: followUpDate
          ? new Date(followUpDate)
          : null,
        notes,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("Update customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deactivateCustomer(
  req: AuthRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = await prisma.customer.update({
      where: {
        id,
      },
      data: {
        status: "INACTIVE",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Customer deactivated successfully",
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("Deactivate customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}