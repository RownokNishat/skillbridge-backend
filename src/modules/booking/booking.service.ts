import { prisma } from "../../lib/prisma";

const createBooking = async (studentId: string, payload: any) => {
    const booking = await prisma.booking.create({
        data: {
            studentId,
            tutorId: payload.tutorId,
            startTime: new Date(payload.startTime),
            endTime: new Date(payload.endTime),
            status: "PENDING"
        }
    });
    return booking;
};

const getMyBookings = async (userId: string, role: string) => {
    if (role === "STUDENT") {
        return await prisma.booking.findMany({
            where: { studentId: userId },
            include: { tutor: { select: { id: true, name: true, email: true } } }
        });
    } else if (role === "TUTOR") {
         return await prisma.booking.findMany({
            where: { tutorId: userId },
            include: { student: { select: { id: true, name: true, email: true } } }
        });
    }
    return [];
};

export const BookingService = {
    createBooking,
    getMyBookings
};
