import { prisma } from "../../lib/prisma";

const createCategory = async (payload: any) => {
  return await prisma.category.create({ data: payload });
};

const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { createdAt: "desc" }, // Optional: sort by newest
  });
};

const updateCategory = async (id: number, payload: any) => {
  // <--- Changed string to number
  // Check if category exists
  const exists = await prisma.category.findUnique({ where: { id } });
  if (!exists) throw new Error("Category not found");

  return await prisma.category.update({
    where: { id },
    data: payload,
  });
};

const deleteCategory = async (id: number) => {
  // <--- Changed string to number
  // Check if category exists
  const exists = await prisma.category.findUnique({ where: { id } });
  if (!exists) throw new Error("Category not found");

  return await prisma.category.delete({
    where: { id },
  });
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
