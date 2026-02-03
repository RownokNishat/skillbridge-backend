import { Request, Response } from "express";
import { StudentService } from "./student.service";

const getMyProfile = async (req: Request, res: Response) => {
    try {
        const result = await StudentService.getMyProfile(req.user!.id);
        res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            data: result
        });
    } catch (err: any) {
        const statusCode = err.message.includes("not found") ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
};

const updateProfile = async (req: Request, res: Response) => {
    try {
        // Validate that at least one field is provided
        const { name, phone, image } = req.body;

        if (!name && !phone && image === undefined) {
            res.status(400).json({
                success: false,
                message: "At least one field (name, phone, or image) must be provided"
            });
            return;
        }

        const result = await StudentService.updateProfile(req.user!.id, req.body);
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: result
        });
    } catch (err: any) {
        const statusCode = err.message.includes("not found") ? 404 :
                          err.message.includes("Only students") ? 403 : 500;
        res.status(statusCode).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
};

export const StudentController = {
    getMyProfile,
    updateProfile
};
