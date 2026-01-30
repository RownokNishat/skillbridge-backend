import { prisma } from "../../lib/prisma";

const getAllTutors = async (query: any) => {
    const { searchTerm, minPrice, maxPrice } = query;
    
    const where: any = {};
    
    if (minPrice || maxPrice) {
        where.hourlyRate = {};
        if (minPrice) where.hourlyRate.gte = Number(minPrice);
        if (maxPrice) where.hourlyRate.lte = Number(maxPrice);
    }
    
    // searchTerm logic would be complex with category names etc, skipping for now
    
    const tutors = await prisma.tutorProfile.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            categories: true
        }
    });
    return tutors;
};

const getTutorById = async (id: string) => {
    const tutor = await prisma.tutorProfile.findFirst({
        where: { userId: id }, // Assuming ID is User ID
        include: {
            user: { select: { id: true, name: true, email: true } },
            categories: true
        }
    });
    return tutor;
};

const updateProfile = async (userId: string, payload: any) => {
    // Helper to connect categories if provided
    // payload.categories = [1, 2] (Ids)
    
    const existing = await prisma.tutorProfile.findUnique({
        where: { userId }
    });
    
    const data: any = {
        bio: payload.bio,
        hourlyRate: payload.hourlyRate,
        experience: payload.experience,
        availability: payload.availability
    };
    
    // Simple create/update logic
    if (existing) {
        return await prisma.tutorProfile.update({
            where: { userId },
            data
        });
    } else {
        return await prisma.tutorProfile.create({
            data: {
                ...data,
                userId
            }
        });
    }
};

export const TutorService = {
    getAllTutors,
    getTutorById,
    updateProfile
}
