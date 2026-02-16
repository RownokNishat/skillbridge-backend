import { Request, Response } from "express";
import { BookingService } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { tutorId, startTime, endTime } = req.body;

    if (!tutorId || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        message: "Tutor ID, start time, and end time are required",
      });
      return;
    }

    const result = await BookingService.createBooking(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  } catch (err: any) {
    const statusCode =
      err.message.includes("not found") ||
      err.message.includes("not available") ||
      err.message.includes("not a tutor")
        ? 400
        : 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const getMyBookings = async (req: Request, res: Response) => {
  try {
    if (req.user!.role === "ADMIN") {
      const result = await BookingService.getAllBookings();
      res.status(200).json({
        success: true,
        message: "All bookings retrieved successfully",
        data: result,
      });
      return;
    } else {
      const result = await BookingService.getMyBookings(
        req.user!.id,
        req.user!.role,
        req.query,
      );
      res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: result,
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const getBookingById = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id as string);

    if (isNaN(bookingId)) {
      res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
      return;
    }

    const result = await BookingService.getBookingById(
      bookingId,
      req.user!.id,
      req.user!.role || "",
    );
    res.status(200).json({
      success: true,
      message: "Booking retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found")
      ? 404
      : err.message.includes("not authorized")
        ? 403
        : 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const cancelBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id as string);

    if (isNaN(bookingId)) {
      res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
      return;
    }

    const result = await BookingService.cancelBooking(
      bookingId,
      req.user!.id,
      req.user!.role || "",
    );
    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: result,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found")
      ? 404
      : err.message.includes("not authorized")
        ? 403
        : err.message.includes("Cannot cancel") ||
            err.message.includes("already cancelled")
          ? 400
          : 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

export const BookingController = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
