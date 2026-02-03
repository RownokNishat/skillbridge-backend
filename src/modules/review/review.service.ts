import { prisma } from "../../lib/prisma";

const createReview = async (studentId: string, payload: any) => {
    // Validate required fields
    if (!payload.tutorId || !payload.rating || !payload.comment) {
        throw new Error("Tutor ID, rating, and comment are required");
    }

    // Validate rating range
    if (payload.rating < 1 || payload.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
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

    // Check if student has completed a booking with this tutor
    const completedBooking = await prisma.booking.findFirst({
        where: {
            studentId,
            tutorId: payload.tutorId,
            status: "COMPLETED"
        }
    });

    if (!completedBooking) {
        throw new Error("You can only review tutors you have had completed sessions with");
    }

    // Check for duplicate review
    const existingReview = await prisma.review.findFirst({
        where: {
            studentId,
            tutorId: payload.tutorId
        }
    });

    if (existingReview) {
        throw new Error("You have already reviewed this tutor");
    }

    // Create the review
    return await prisma.review.create({
        data: {
            studentId,
            tutorId: payload.tutorId,
            rating: parseInt(payload.rating),
            comment: payload.comment
        },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            },
            tutor: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            }
        }
    });
};

export const ReviewService = {
    createReview
}
