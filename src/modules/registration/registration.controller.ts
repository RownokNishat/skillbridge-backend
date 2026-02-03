import { Request, Response } from "express";
import { RegistrationService } from "./registration.service";
import { UserRole } from "../../middlewares/auth";

const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            res.status(400).json({
                success: false,
                message: "Name, email, password, and role are required"
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
            return;
        }

        // Validate password length
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
            return;
        }

        // Validate role
        if (role !== UserRole.STUDENT && role !== UserRole.TUTOR) {
            res.status(400).json({
                success: false,
                message: "Role must be either STUDENT or TUTOR"
            });
            return;
        }

        const result = await RegistrationService.registerUser({
            name,
            email,
            password,
            role,
            phone
        });

        res.status(201).json({
            success: true,
            message: result.message,
            data: {
                user: result.user,
                nextStep: result.nextStep
            }
        });
    } catch (err: any) {
        res.status(400).json({
            success: false,
            message: err.message || "Registration failed"
        });
    }
};

const setupTutorProfile = async (req: Request, res: Response) => {
    try {
        const { bio, hourlyRate, experience, categoryIds, availability } = req.body;

        // Validation
        if (!bio || !hourlyRate || !experience || !categoryIds) {
            res.status(400).json({
                success: false,
                message: "Bio, hourlyRate, experience, and categoryIds are required"
            });
            return;
        }

        if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
            res.status(400).json({
                success: false,
                message: "At least one category must be selected"
            });
            return;
        }

        if (hourlyRate <= 0) {
            res.status(400).json({
                success: false,
                message: "Hourly rate must be greater than 0"
            });
            return;
        }

        if (experience < 0) {
            res.status(400).json({
                success: false,
                message: "Experience cannot be negative"
            });
            return;
        }

        const result = await RegistrationService.setupTutorProfile(req.user!.id, {
            bio,
            hourlyRate,
            experience,
            categoryIds,
            availability
        });

        res.status(201).json({
            success: true,
            message: result.message,
            data: {
                profile: result.profile,
                nextStep: result.nextStep
            }
        });
    } catch (err: any) {
        res.status(400).json({
            success: false,
            message: err.message || "Profile setup failed"
        });
    }
};

const checkStatus = async (req: Request, res: Response) => {
    try {
        const result = await RegistrationService.checkProfileStatus(req.user!.id);

        res.status(200).json({
            success: true,
            message: "Profile status retrieved successfully",
            data: result
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
};

export const RegistrationController = {
    register,
    setupTutorProfile,
    checkStatus
};
