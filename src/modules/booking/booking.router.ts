import express, { Router } from "express";
import { BookingController } from "./booking.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router: Router = express.Router();

router.post("/", auth(UserRole.STUDENT), BookingController.createBooking);
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR),
  BookingController.getMyBookings,
);
router.get(
  "/:id",
  auth(UserRole.STUDENT, UserRole.TUTOR),
  BookingController.getBookingById,
);
router.patch(
  "/:id/cancel",
  auth(UserRole.STUDENT, UserRole.TUTOR),
  BookingController.cancelBooking,
);

export const BookingRouter = router;
