import { Request, Response } from "express";
import { BookingService } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
    try {
        const result = await BookingService.createBooking(req.user!.id, req.body);
        res.status(200).json({
            success: true,
            message: "Booking created successfully",
            data: result
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

const getMyBookings = async (req: Request, res: Response) => {
    try {
        const result = await BookingService.getMyBookings(req.user!.id, req.user!.role);
        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: result
        });
    } catch (err: any) {
         res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

export const BookingController = {
    createBooking,
    getMyBookings
}
