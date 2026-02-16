import { Request, Response } from "express";
import { UserService } from "./user.service";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await UserService.getAllUsers();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const getMyProfile = async (req: Request, res: Response) => {
  try {
    const result = await UserService.getMyProfile(req.user!.id);
    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!userId || !status) {
      res.status(400).json({
        success: false,
        message: "User ID and status are required",
      });
      return;
    }

    const result = await UserService.updateUserStatus(userId as string, status);
    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const getAdminStats = async (req: Request, res: Response) => {
  try {
    const result = await UserService.getAdminStats();
    res.status(200).json({
      success: true,
      message: "Admin stats retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

export const UserController = {
  getAllUsers,
  getMyProfile,
  updateUserStatus,
  getAdminStats,
};
