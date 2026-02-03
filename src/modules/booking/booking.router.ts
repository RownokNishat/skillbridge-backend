import express from "express";
import { BookingController } from "./booking.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.post("/", auth(UserRole.STUDENT), BookingController.createBooking);
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR),
  BookingController.getMyBookings,
);

export const BookingRouter = router;
