import { Request, Response } from "express";
import { TutorService } from "./tutor.service";

const getAllTutors = async (req: Request, res: Response) => {
    try {
        const result = await TutorService.getAllTutors(req.query);
        res.status(200).json({
            success: true,
            message: "Tutors retrieved successfully",
            data: result
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

const getTutorById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            res.status(400).json({ success: false, message: "ID is required" });
            return;
        }
        const result = await TutorService.getTutorById(id);
        res.status(200).json({
            success: true,
            message: "Tutor retrieved successfully",
            data: result
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

const updateProfile = async (req: Request, res: Response) => {
    try {
        const result = await TutorService.updateProfile(req.user!.id, req.body);
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: result
        });
    } catch (err: any) {
         res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

export const TutorController = {
    getAllTutors,
    getTutorById,
    updateProfile
}
