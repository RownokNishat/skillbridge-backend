import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true, // <--- Added this line so frontend knows current status
      createdAt: true,
    },
  });
  return users;
};

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tutorProfile: true,
    },
  });
  return user;
};

// Add this new function
const updateUserStatus = async (userId: string, status: string) => {
  // Validate status allows only 'active' or 'banned'
  // Adjust these values based on your Prisma Enum if it's strict
  if (!["active", "banned"].includes(status)) {
    throw new Error("Invalid status");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, status: true },
  });
  return user;
};

const getAdminStats = async () => {
  const [totalUsers, totalStudents, totalTutors, totalBookings] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TUTOR" } }),
    prisma.booking.count(),
  ]);

  const completedBookings = await prisma.booking.count({
    where: {
      status: "COMPLETED",
    },
  });

  const bookingsWithTutorRates = await prisma.booking.findMany({
    where: {
      status: "COMPLETED",
    },
    select: {
      startTime: true,
      endTime: true,
      tutor: {
        select: {
          tutorProfile: {
            select: {
              hourlyRate: true,
            },
          },
        },
      },
    },
  });

  let totalRevenue = 0;
  for (const booking of bookingsWithTutorRates) {
    const durationHours = (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60);
    const hourlyRate = booking.tutor?.tutorProfile?.hourlyRate || 0;
    totalRevenue += durationHours * hourlyRate;
  }

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return {
    totalUsers,
    totalStudents,
    totalTutors,
    totalBookings,
    totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
    recentUsers,
  };
};

export const UserService = {
  getAllUsers,
  getMyProfile,
  updateUserStatus,
  getAdminStats,
};
