import express, { Router } from "express";
import { CategoryController } from "./category.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router: Router = express.Router();

// Public route to view categories
router.get("/categories", CategoryController.getAllCategories);

// Protected Admin routes
router.post(
  "/categories",
  auth(UserRole.ADMIN),
  CategoryController.createCategory,
);

router.patch(
  "/categories/:id",
  auth(UserRole.ADMIN),
  CategoryController.updateCategory,
);

router.delete(
  "/categories/:id",
  auth(UserRole.ADMIN),
  CategoryController.deleteCategory,
);

export const CategoryRouter = router;
