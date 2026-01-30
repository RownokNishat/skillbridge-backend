import { prisma } from "../../lib/prisma";

const createCategory = async (payload: any) => {
    return await prisma.category.create({ data: payload });
};

const getAllCategories = async () => {
    return await prisma.category.findMany();
};

export const CategoryService = {
    createCategory,
    getAllCategories
}
