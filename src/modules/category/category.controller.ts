import { Request, Response } from "express";
import { CategoryService } from "./category.service";

const createCategory = async (req: Request, res: Response) => {
    try {
        const result = await CategoryService.createCategory(req.body);
        res.status(200).json({
            success: true,
            message: "Category created successfully",
            data: result
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

const getAllCategories = async (req: Request, res: Response) => {
    try {
        const result = await CategoryService.getAllCategories();
        res.status(200).json({
            success: true,
            message: "Categories retrieved successfully",
            data: result
        });
    } catch (err: any) {
         res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        });
    }
}

export const CategoryController = {
    createCategory,
    getAllCategories
}
