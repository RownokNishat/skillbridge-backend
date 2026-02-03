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

export const UserService = {
  getAllUsers,
  getMyProfile,
  updateUserStatus,
};
