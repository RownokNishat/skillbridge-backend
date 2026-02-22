import { prisma } from "../../lib/prisma";

const getAllTutors = async (query: any) => {
  const {
    search,
    categoryId,
    minRate,
    maxRate,
    minRating,
    sortBy,
    sortOrder = "desc",
  } = query;

  const where: any = {};

  if (minRate || maxRate) {
    where.hourlyRate = {};
    if (minRate) where.hourlyRate.gte = Number(minRate);
    if (maxRate) where.hourlyRate.lte = Number(maxRate);
  }

  if (categoryId) {
    where.categories = {
      some: {
        id: Number(categoryId),
      },
    };
  }

  if (search) {
    where.OR = [
      { bio: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };

  if (sortBy === "price") {
    orderBy = { hourlyRate: sortOrder };
  } else if (sortBy === "experience") {
    orderBy = { experience: sortOrder };
  }

  const tutors = await prisma.tutorProfile.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      categories: true,
    },
    orderBy,
  });

  let tutorsWithRatings = await Promise.all(
    tutors.map(async (tutor) => {
      const reviews = await prisma.review.findMany({
        where: { tutorId: tutor.userId },
        select: { rating: true },
      });

      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) /
            reviews.length
          : 0;

      return {
        ...tutor,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: reviews.length,
      };
    }),
  );

  if (minRating) {
    const minRatingVal = Number(minRating);
    tutorsWithRatings = tutorsWithRatings.filter(
      (tutor: { averageRating: number }) => tutor.averageRating >= minRatingVal,
    );
  }

  if (sortBy === "rating") {
    tutorsWithRatings.sort((a: { averageRating: number }, b: { averageRating: number }) => {
      if (sortOrder === "asc") {
        return a.averageRating - b.averageRating;
      } else {
        return b.averageRating - a.averageRating;
      }
    });
  }

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
          image: true,
        },
      },
      categories: true,
    },
  });

  if (!tutor) {
    throw new Error("Tutor profile not found");
  }

  const reviews = await prisma.review.findMany({
    where: { tutorId: id },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / reviews.length
      : 0;

  return {
    ...tutor,
    reviews,
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews: reviews.length,
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
          phone: true,
        },
      },
      categories: true,
    },
  });
  return profile;
};

const updateProfile = async (userId: string, payload: any) => {
  const existing = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  const data: any = {
    bio: payload.bio,
    hourlyRate: payload.hourlyRate ? Number(payload.hourlyRate) : undefined,
    experience: payload.experience ? Number(payload.experience) : undefined,
    availability: payload.availability,
  };

  Object.keys(data).forEach(
    (key) => data[key] === undefined && delete data[key],
  );

  if (payload.categoryIds && Array.isArray(payload.categoryIds)) {
    data.categories = {
      set: payload.categoryIds.map((id: number) => ({ id })),
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
            email: true,
          },
        },
      },
    });
  } else {
    const createData: any = {
      userId,
      bio: payload.bio || "",
      hourlyRate: payload.hourlyRate ? Number(payload.hourlyRate) : 0,
      experience: payload.experience ? Number(payload.experience) : 0,
      availability: payload.availability || "{}",
    };

    if (payload.categoryIds && Array.isArray(payload.categoryIds)) {
      createData.categories = {
        connect: payload.categoryIds.map((id: number) => ({ id })),
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
            email: true,
          },
        },
      },
    });
  }
};

const updateAvailability = async (userId: string, availability: any) => {
  const existing = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw new Error(
      "Tutor profile not found. Please create your profile first.",
    );
  }

  const availabilityString =
    typeof availability === "string"
      ? availability
      : JSON.stringify(availability);

  return await prisma.tutorProfile.update({
    where: { userId },
    data: { availability: availabilityString },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const getMySessions = async (userId: string, query: any) => {
  const { status } = query;
  const where: any = {
    tutorId: userId,
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
          image: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  });
  return sessions;
};

const markSessionComplete = async (userId: string, bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.tutorId !== userId) {
    throw new Error("You are not authorized to update this booking");
  }

  if (booking.status !== "CONFIRMED") {
    throw new Error("Only confirmed bookings can be marked as completed");
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const getDashboardStats = async (userId: string) => {
  const totalSessions = await prisma.booking.count({
    where: { tutorId: userId },
  });
  const completedSessions = await prisma.booking.count({
    where: {
      tutorId: userId,
      status: "COMPLETED",
    },
  });
  const upcomingSessions = await prisma.booking.count({
    where: {
      tutorId: userId,
      status: "CONFIRMED",
      startTime: {
        gte: new Date(),
      },
    },
  });
  const pendingSessions = await prisma.booking.count({
    where: {
      tutorId: userId,
      status: "PENDING",
    },
  });
  const reviews = await prisma.review.findMany({
    where: { tutorId: userId },
    select: { rating: true },
  });
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / reviews.length
      : 0;

  const recentSessions = await prisma.booking.findMany({
    where: { tutorId: userId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
    take: 5,
  });

  const completedBookings = await prisma.booking.findMany({
    where: {
      tutorId: userId,
      status: "COMPLETED",
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  const hourlyRate = tutorProfile?.hourlyRate || 0;
  const totalEarnings = completedBookings.reduce((sum: number, booking: { startTime: Date; endTime: Date }) => {
    const hours =
      (booking.endTime.getTime() - booking.startTime.getTime()) /
      (1000 * 60 * 60);
    return sum + hours * hourlyRate;
  }, 0);

  return {
    totalSessions,
    completedSessions,
    upcomingSessions,
    pendingSessions,
    totalReviews: reviews.length,
    averageRating: Number(averageRating.toFixed(1)),
    totalEarnings: Number(totalEarnings.toFixed(2)),
    recentSessions,
  };
};

const getFeaturedTutors = async () => {
  const tutors = await prisma.tutorProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      categories: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const tutorsWithRatings = await Promise.all(
    tutors.map(async (tutor: { userId: string }) => {
      const reviews = await prisma.review.findMany({
        where: { tutorId: tutor.userId },
        select: { rating: true },
      });

      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) /
            reviews.length
          : 0;

      return {
        ...tutor,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: reviews.length,
      };
    }),
  );

  const featuredTutors = tutorsWithRatings
    .sort((a: { averageRating: number; totalReviews: number }, b: { averageRating: number; totalReviews: number }) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return b.totalReviews - a.totalReviews;
    })
    .slice(0, 6);

  return featuredTutors;
};

const acceptSession = async (userId: string, bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.tutorId !== userId) throw new Error("Unauthorized");
  if (booking.status !== "PENDING")
    throw new Error("Only pending sessions can be accepted");

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
    include: { student: { select: { id: true, name: true, email: true } } },
  });
};

const cancelSession = async (userId: string, bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.tutorId !== userId) throw new Error("Unauthorized");
  if (booking.status === "COMPLETED")
    throw new Error("Cannot cancel completed sessions");

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
    include: { student: { select: { id: true, name: true, email: true } } },
  });
};

export const TutorService = {
  getAllTutors,
  getTutorById,
  getMyProfile,
  updateProfile,
  updateAvailability,
  getMySessions,
  markSessionComplete,
  getDashboardStats,
  getFeaturedTutors,
  acceptSession,
  cancelSession,
};
