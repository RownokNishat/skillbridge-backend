import { Request, Response } from "express";
import { CategoryService } from "./category.service";

const createCategory = async (req: Request, res: Response) => {
  try {
    const result = await CategoryService.createCategory(req.body);
    res.status(200).json({
      success: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await CategoryService.getAllCategories();
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id); // <--- Convert to Integer

    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid ID format" });
      return;
    }

    const result = await CategoryService.updateCategory(id, req.body);
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id); // <--- Convert to Integer

    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid ID format" });
      return;
    }

    const result = await CategoryService.deleteCategory(id);
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

export const CategoryController = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
