import { Request, Response } from "express";
import { ReviewService } from "./review.service";

const createReview = async (req: Request, res: Response) => {
    try {
        // Validate request body
        const { tutorId, rating, comment } = req.body;

        if (!tutorId || !rating || !comment) {
            res.status(400).json({
                success: false,
                message: "Tutor ID, rating, and comment are required"
            });
            return;
        }

        // Validate rating
        const ratingNum = parseInt(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            res.status(400).json({
                success: false,
                message: "Rating must be a number between 1 and 5"
            });
            return;
        }

        const result = await ReviewService.createReview(req.user!.id, req.body);
        res.status(201).json({
            success: true,
            message: "Review created successfully",
            data: result
        });
    } catch (err: any) {
        const statusCode = err.message.includes("not found") ||
                          err.message.includes("not a tutor") ? 404 :
                          err.message.includes("only review") ||
                          err.message.includes("already reviewed") ||
                          err.message.includes("must be between") ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

export const ReviewController = {
    createReview
}
