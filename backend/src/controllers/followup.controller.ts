import { Response } from "express";
import prisma from "../config/database.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export async function createFollowUp(
  req: AuthRequest,
  res: Response
) {
  try {
    const customerId = Array.isArray(req.params.customerId)
  ? req.params.customerId[0]
  : req.params.customerId;
    const { note, followUpDate } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Follow-up note is required",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

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

    const followUp = await prisma.followUp.create({
      data: {
        customerId,
        createdById: req.user.userId,
        note,
        followUpDate: followUpDate
          ? new Date(followUpDate)
          : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Follow-up created successfully",
      data: {
        followUp,
      },
    });
  } catch (error) {
    console.error("Create follow-up error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getCustomerFollowUps(
  req: AuthRequest,
  res: Response
) {
  try {
    const customerId = Array.isArray(req.params.customerId)
  ? req.params.customerId[0]
  : req.params.customerId;

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

    const followUps = await prisma.followUp.findMany({
      where: {
        customerId,
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
        followUps,
      },
    });
  } catch (error) {
    console.error("Get follow-ups error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}