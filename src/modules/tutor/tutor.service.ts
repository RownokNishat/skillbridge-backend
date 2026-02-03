import { prisma } from "../../lib/prisma";

const getAllTutors = async (query: any) => {
    const { searchTerm, minPrice, maxPrice, categoryId } = query;

    const where: any = {};

    if (minPrice || maxPrice) {
        where.hourlyRate = {};
        if (minPrice) where.hourlyRate.gte = Number(minPrice);
        if (maxPrice) where.hourlyRate.lte = Number(maxPrice);
    }

    if (categoryId) {
        where.categories = {
            some: {
                id: Number(categoryId)
            }
        };
    }

    if (searchTerm) {
        where.OR = [
            { bio: { contains: searchTerm, mode: 'insensitive' } },
            { user: { name: { contains: searchTerm, mode: 'insensitive' } } }
        ];
    }

    const tutors = await prisma.tutorProfile.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            },
            categories: true,
            _count: {
                select: {
                    user: {
                        select: {
                            receivedReviews: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Calculate average rating for each tutor
    const tutorsWithRatings = await Promise.all(
        tutors.map(async (tutor) => {
            const reviews = await prisma.review.findMany({
                where: { tutorId: tutor.userId },
                select: { rating: true }
            });

            const averageRating = reviews.length > 0
                ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                : 0;

            return {
                ...tutor,
                averageRating: Number(averageRating.toFixed(1)),
                totalReviews: reviews.length
            };
        })
    );

    return tutorsWithRatings;
};

const getTutorById = async (id: string) => {
    const tutor = await prisma.tutorProfile.findFirst({
        where: { userId: id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            },
            categories: true
        }
    });

    if (!tutor) {
        throw new Error("Tutor profile not found");
    }

    // Get reviews with student details
    const reviews = await prisma.review.findMany({
        where: { tutorId: id },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    return {
        ...tutor,
        reviews,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: reviews.length
    };
};

const getMyProfile = async (userId: string) => {
    const profile = await prisma.tutorProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    phone: true
                }
            },
            categories: true
        }
    });

    return profile;
};

const updateProfile = async (userId: string, payload: any) => {
    const existing = await prisma.tutorProfile.findUnique({
        where: { userId }
    });

    const data: any = {
        bio: payload.bio,
        hourlyRate: payload.hourlyRate ? Number(payload.hourlyRate) : undefined,
        experience: payload.experience ? Number(payload.experience) : undefined,
        availability: payload.availability
    };

    // Remove undefined fields
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    // Handle category connections
    if (payload.categoryIds && Array.isArray(payload.categoryIds)) {
        data.categories = {
            set: payload.categoryIds.map((id: number) => ({ id }))
        };
    }

    if (existing) {
        return await prisma.tutorProfile.update({
            where: { userId },
            data,
            include: {
                categories: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    } else {
        // Create new profile
        const createData: any = {
            userId,
            bio: payload.bio || '',
            hourlyRate: payload.hourlyRate ? Number(payload.hourlyRate) : 0,
            experience: payload.experience ? Number(payload.experience) : 0,
            availability: payload.availability || '{}'
        };

        if (payload.categoryIds && Array.isArray(payload.categoryIds)) {
            createData.categories = {
                connect: payload.categoryIds.map((id: number) => ({ id }))
            };
        }

        return await prisma.tutorProfile.create({
            data: createData,
            include: {
                categories: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }
};

const updateAvailability = async (userId: string, availability: string) => {
    const existing = await prisma.tutorProfile.findUnique({
        where: { userId }
    });

    if (!existing) {
        throw new Error("Tutor profile not found. Please create your profile first.");
    }

    return await prisma.tutorProfile.update({
        where: { userId },
        data: { availability },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });
};

const getMySessions = async (userId: string, query: any) => {
    const { status } = query;

    const where: any = {
        tutorId: userId
    };

    if (status) {
        where.status = status.toUpperCase();
    }

    const sessions = await prisma.booking.findMany({
        where,
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            }
        },
        orderBy: {
            startTime: 'desc'
        }
    });

    return sessions;
};

const markSessionComplete = async (userId: string, bookingId: number) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.tutorId !== userId) {
        throw new Error("You are not authorized to update this booking");
    }

    if (booking.status !== 'CONFIRMED') {
        throw new Error("Only confirmed bookings can be marked as completed");
    }

    return await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });
};

const getDashboardStats = async (userId: string) => {
    // Get total sessions
    const totalSessions = await prisma.booking.count({
        where: { tutorId: userId }
    });

    // Get completed sessions
    const completedSessions = await prisma.booking.count({
        where: {
            tutorId: userId,
            status: 'COMPLETED'
        }
    });

    // Get upcoming sessions
    const upcomingSessions = await prisma.booking.count({
        where: {
            tutorId: userId,
            status: 'CONFIRMED',
            startTime: {
                gte: new Date()
            }
        }
    });

    // Get pending sessions
    const pendingSessions = await prisma.booking.count({
        where: {
            tutorId: userId,
            status: 'PENDING'
        }
    });

    // Get reviews
    const reviews = await prisma.review.findMany({
        where: { tutorId: userId },
        select: { rating: true }
    });

    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    // Get recent sessions
    const recentSessions = await prisma.booking.findMany({
        where: { tutorId: userId },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            }
        },
        orderBy: {
            startTime: 'desc'
        },
        take: 5
    });

    // Calculate total earnings (completed sessions)
    const completedBookings = await prisma.booking.findMany({
        where: {
            tutorId: userId,
            status: 'COMPLETED'
        },
        select: {
            startTime: true,
            endTime: true
        }
    });

    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { userId }
    });

    const hourlyRate = tutorProfile?.hourlyRate || 0;
    const totalEarnings = completedBookings.reduce((sum, booking) => {
        const hours = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60);
        return sum + (hours * hourlyRate);
    }, 0);

    return {
        totalSessions,
        completedSessions,
        upcomingSessions,
        pendingSessions,
        totalReviews: reviews.length,
        averageRating: Number(averageRating.toFixed(1)),
        totalEarnings: Number(totalEarnings.toFixed(2)),
        recentSessions
    };
};

export const TutorService = {
    getAllTutors,
    getTutorById,
    getMyProfile,
    updateProfile,
    updateAvailability,
    getMySessions,
    markSessionComplete,
    getDashboardStats
}
