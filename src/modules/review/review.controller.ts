import { Request, Response } from "express";
import { ReviewService } from "./review.service";

const createReview = async (req: Request, res: Response) => {
    try {
        const result = await ReviewService.createReview(req.user!.id, req.body);
        res.status(200).json({
            success: true,
            message: "Review created successfully",
            data: result
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

export const ReviewController = {
    createReview
}
