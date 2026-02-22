import express, { Router } from "express";
import { TutorController } from "./tutor.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router: Router = express.Router();

// Public routes
router.get("/tutors/featured", TutorController.getFeaturedTutors);
router.get("/tutors", TutorController.getAllTutors);
router.get("/tutors/:id", TutorController.getTutorById);

// Tutor private routes
router.get(
  "/tutor/profile",
  auth(UserRole.TUTOR),
  TutorController.getMyProfile,
);
router.put(
  "/tutor/profile",
  auth(UserRole.TUTOR),
  TutorController.updateProfile,
);
router.put(
  "/tutor/availability",
  auth(UserRole.TUTOR),
  TutorController.updateAvailability,
);
router.get(
  "/tutor/sessions",
  auth(UserRole.TUTOR),
  TutorController.getMySessions,
);
router.patch(
  "/tutor/sessions/:id/complete",
  auth(UserRole.TUTOR),
  TutorController.markSessionComplete,
);
router.get(
  "/tutor/dashboard",
  auth(UserRole.TUTOR),
  TutorController.getDashboard,
);
router.patch(
  "/tutor/sessions/:id/accept",
  auth(UserRole.TUTOR),
  TutorController.acceptSession,
);
router.patch(
  "/tutor/sessions/:id/cancel",
  auth(UserRole.TUTOR),
  TutorController.cancelSession,
);
export const TutorRouter = router;
