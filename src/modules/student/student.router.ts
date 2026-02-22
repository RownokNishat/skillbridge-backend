import express from "express";
import { StudentController } from "./student.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router: express.Router = express.Router();

// Student routes
router.get("/student/profile", auth(UserRole.STUDENT), StudentController.getMyProfile);
router.put("/student/profile", auth(UserRole.STUDENT), StudentController.updateProfile);

export const StudentRouter = router;
