import { Request, Response } from "express";
import { UserService } from "./user.service";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getAllUsers();
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

const getMyProfile = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getMyProfile(req.user!.id);
         res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            data: result
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

export const UserController = {
    getAllUsers,
    getMyProfile
}
