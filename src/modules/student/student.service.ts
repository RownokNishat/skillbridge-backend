import { prisma } from "../../lib/prisma";

const getMyProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    const totalBookings = await prisma.booking.count({
        where: { studentId: userId }
    });

    const completedBookings = await prisma.booking.count({
        where: {
            studentId: userId,
            status: "COMPLETED"
        }
    });

    const upcomingBookings = await prisma.booking.count({
        where: {
            studentId: userId,
            status: "CONFIRMED",
            startTime: {
                gte: new Date()
            }
        }
    });

    const reviewsGiven = await prisma.review.count({
        where: { studentId: userId }
    });

    return {
        ...user,
        stats: {
            totalBookings,
            completedBookings,
            upcomingBookings,
            reviewsGiven
        }
    };
};

const updateProfile = async (userId: string, payload: any) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.role !== "STUDENT") {
        throw new Error("Only students can update their profile using this endpoint");
    }

    // Prepare update data (only allow specific fields)
    const updateData: any = {};

    if (payload.name !== undefined) {
        updateData.name = payload.name;
    }

    if (payload.phone !== undefined) {
        updateData.phone = payload.phone;
    }

    if (payload.image !== undefined) {
        updateData.image = payload.image;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return updatedUser;
};

export const StudentService = {
    getMyProfile,
    updateProfile
};
