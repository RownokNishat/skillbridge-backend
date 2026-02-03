import express from "express";
import { CategoryController } from "./category.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.get("/categories", CategoryController.getAllCategories);
router.post(
  "/categories",
  auth(UserRole.ADMIN),
  CategoryController.createCategory,
);

export const CategoryRouter = router;
