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

const getMyProfile = async (req: Request, res: Response) => {
    try {
        const result = await TutorService.getMyProfile(req.user!.id);
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

const updateAvailability = async (req: Request, res: Response) => {
    try {
        const { availability } = req.body;
        if (!availability) {
            res.status(400).json({ success: false, message: "Availability is required" });
            return;
        }
        const result = await TutorService.updateAvailability(req.user!.id, availability);
        res.status(200).json({
            success: true,
            message: "Availability updated successfully",
            data: result
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

const getMySessions = async (req: Request, res: Response) => {
    try {
        const result = await TutorService.getMySessions(req.user!.id, req.query);
        res.status(200).json({
            success: true,
            message: "Sessions retrieved successfully",
            data: result
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

const markSessionComplete = async (req: Request, res: Response) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (!bookingId) {
            res.status(400).json({ success: false, message: "Booking ID is required" });
            return;
        }
        const result = await TutorService.markSessionComplete(req.user!.id, bookingId);
        res.status(200).json({
            success: true,
            message: "Session marked as complete",
            data: result
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

const getDashboard = async (req: Request, res: Response) => {
    try {
        const result = await TutorService.getDashboardStats(req.user!.id);
        res.status(200).json({
            success: true,
            message: "Dashboard stats retrieved successfully",
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
    getMyProfile,
    updateProfile,
    updateAvailability,
    getMySessions,
    markSessionComplete,
    getDashboard
}
