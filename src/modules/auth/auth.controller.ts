import { Request, Response } from "express";

const getSession = async (req: Request, res: Response) => {
    try {
        // The auth middleware already validated the token and attached user to req.user
        res.status(200).json({
            success: true,
            message: "Session retrieved successfully",
            data: {
                user: req.user
            }
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

export const AuthController = {
    getSession
}
