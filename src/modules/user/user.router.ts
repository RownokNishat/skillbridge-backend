import express from "express";
import { UserController } from "./user.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.get("/admin/users", auth(UserRole.ADMIN), UserController.getAllUsers);
router.patch(
  "/admin/users/:id/status",
  auth(UserRole.ADMIN),
  UserController.updateUserStatus,
);

export const UserRouter = router;
