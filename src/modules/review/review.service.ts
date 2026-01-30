import { prisma } from "../../lib/prisma";

const createReview = async (studentId: string, payload: any) => {
    return await prisma.review.create({
        data: {
            studentId,
            tutorId: payload.tutorId,
            rating: payload.rating,
            comment: payload.comment
        }
    });
};

export const ReviewService = {
    createReview
}
