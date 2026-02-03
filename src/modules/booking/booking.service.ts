import { prisma } from "../../lib/prisma";

const createBooking = async (studentId: string, payload: any) => {
    // Validate required fields
    if (!payload.tutorId || !payload.startTime || !payload.endTime) {
        throw new Error("Tutor ID, start time, and end time are required");
    }

    const startTime = new Date(payload.startTime);
    const endTime = new Date(payload.endTime);

    // Validate times
    if (startTime >= endTime) {
        throw new Error("End time must be after start time");
    }

    if (startTime < new Date()) {
        throw new Error("Cannot book sessions in the past");
    }

    // Check if tutor exists
    const tutor = await prisma.user.findUnique({
        where: { id: payload.tutorId }
    });

    if (!tutor) {
        throw new Error("Tutor not found");
    }

    if (tutor.role !== "TUTOR") {
        throw new Error("User is not a tutor");
    }

    // Check for overlapping bookings for the tutor
    const overlappingBooking = await prisma.booking.findFirst({
        where: {
            tutorId: payload.tutorId,
            status: {
                in: ["PENDING", "CONFIRMED"]
            },
            OR: [
                {
                    AND: [
                        { startTime: { lte: startTime } },
                        { endTime: { gt: startTime } }
                    ]
                },
                {
                    AND: [
                        { startTime: { lt: endTime } },
                        { endTime: { gte: endTime } }
                    ]
                },
                {
                    AND: [
                        { startTime: { gte: startTime } },
                        { endTime: { lte: endTime } }
                    ]
                }
            ]
        }
    });

    if (overlappingBooking) {
        throw new Error("Tutor is not available at this time");
    }

    const booking = await prisma.booking.create({
        data: {
            studentId,
            tutorId: payload.tutorId,
            startTime,
            endTime,
            status: "PENDING"
        },
        include: {
            tutor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            }
        }
    });
    return booking;
};

const getMyBookings = async (userId: string, role: string, query?: any) => {
    const { status, sortBy = 'startTime', order = 'desc' } = query || {};

    const where: any = {};
    const orderBy: any = {};

    if (role === "STUDENT") {
        where.studentId = userId;
    } else if (role === "TUTOR") {
        where.tutorId = userId;
    } else {
        return [];
    }

    // Filter by status if provided
    if (status) {
        where.status = status.toUpperCase();
    }

    // Set sorting
    orderBy[sortBy] = order;

    const bookings = await prisma.booking.findMany({
        where,
        include: role === "STUDENT"
            ? {
                tutor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
            : {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            },
        orderBy
    });

    return bookings;
};

const getBookingById = async (bookingId: number, userId: string, role: string) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            },
            tutor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            }
        }
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    // Authorization check
    if (role === "STUDENT" && booking.studentId !== userId) {
        throw new Error("You are not authorized to view this booking");
    }

    if (role === "TUTOR" && booking.tutorId !== userId) {
        throw new Error("You are not authorized to view this booking");
    }

    return booking;
};

const cancelBooking = async (bookingId: number, userId: string, role: string) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    // Authorization check
    if (role === "STUDENT" && booking.studentId !== userId) {
        throw new Error("You are not authorized to cancel this booking");
    }

    if (role === "TUTOR" && booking.tutorId !== userId) {
        throw new Error("You are not authorized to cancel this booking");
    }

    // Check if booking can be cancelled
    if (booking.status === "COMPLETED") {
        throw new Error("Cannot cancel a completed booking");
    }

    if (booking.status === "CANCELLED") {
        throw new Error("Booking is already cancelled");
    }

    // Update booking status to cancelled
    const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            },
            tutor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            }
        }
    });

    return updatedBooking;
};

export const BookingService = {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking
};
