import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth";

interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
}

interface TutorProfileSetup {
    bio: string;
    hourlyRate: number;
    experience: number;
    categoryIds: number[];
    availability?: string;
}

const registerUser = async (data: RegisterData) => {
    const { name, email, password, role, phone } = data;

    // Validate role (only STUDENT and TUTOR can register via API)
    if (role !== UserRole.STUDENT && role !== UserRole.TUTOR) {
        throw new Error("Invalid role. Only STUDENT and TUTOR roles are allowed for registration.");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error("User with this email already exists");
    }

    // Register using Better-Auth
    const response = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
            role,
            phone: phone || undefined
        }
    });

    if (!response) {
        throw new Error("Registration failed");
    }

    // Auto-verify email (email verification disabled for now)
    await prisma.user.update({
        where: { email },
        data: { emailVerified: true }
    });

    // Get the created user
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            phone: true,
            createdAt: true
        }
    });

    return {
        user,
        message: role === UserRole.TUTOR
            ? "Registration successful! Please complete your tutor profile to start receiving bookings."
            : "Registration successful! You can now start booking sessions.",
        nextStep: role === UserRole.TUTOR ? "COMPLETE_PROFILE" : "READY"
    };
};

const setupTutorProfile = async (userId: string, profileData: TutorProfileSetup) => {
    // Verify user is a tutor
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, emailVerified: true }
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.role !== UserRole.TUTOR) {
        throw new Error("Only tutors can create a tutor profile");
    }

    // Check if profile already exists
    const existingProfile = await prisma.tutorProfile.findUnique({
        where: { userId }
    });

    if (existingProfile) {
        throw new Error("Tutor profile already exists. Use update profile endpoint instead.");
    }

    // Validate categories
    if (!profileData.categoryIds || profileData.categoryIds.length === 0) {
        throw new Error("At least one category must be selected");
    }

    const categories = await prisma.category.findMany({
        where: {
            id: { in: profileData.categoryIds }
        }
    });

    if (categories.length !== profileData.categoryIds.length) {
        throw new Error("Some category IDs are invalid");
    }

    // Create tutor profile
    const profile = await prisma.tutorProfile.create({
        data: {
            userId,
            bio: profileData.bio,
            hourlyRate: Number(profileData.hourlyRate),
            experience: Number(profileData.experience),
            availability: profileData.availability || JSON.stringify({}),
            categories: {
                connect: profileData.categoryIds.map(id => ({ id }))
            }
        },
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

    return {
        profile,
        message: "Tutor profile created successfully! You can now start receiving bookings.",
        nextStep: "SET_AVAILABILITY" // Optional: guide them to set availability
    };
};

const checkProfileStatus = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            tutorProfile: {
                select: {
                    id: true,
                    bio: true,
                    hourlyRate: true,
                    experience: true,
                    availability: true,
                    categories: true
                }
            }
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    const status = {
        userId: user.id,
        role: user.role,
        emailVerified: user.emailVerified,
        profileComplete: false,
        profileExists: false,
        nextStep: ""
    };

    if (user.role === UserRole.TUTOR) {
        status.profileExists = !!user.tutorProfile;
        status.profileComplete = !!(
            user.tutorProfile?.bio &&
            user.tutorProfile?.hourlyRate &&
            user.tutorProfile?.experience &&
            user.tutorProfile?.categories.length > 0
        );

        // Email verification removed - check profile completion directly
        if (!status.profileExists) {
            status.nextStep = "COMPLETE_PROFILE";
        } else if (!status.profileComplete) {
            status.nextStep = "UPDATE_PROFILE";
        } else if (!user.tutorProfile?.availability || user.tutorProfile.availability === '{}') {
            status.nextStep = "SET_AVAILABILITY";
        } else {
            status.nextStep = "READY";
        }
    } else {
        status.profileComplete = true;
        status.profileExists = true;
        status.nextStep = "READY"; // Students are ready immediately after registration
    }

    return {
        ...status,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified
        },
        tutorProfile: user.tutorProfile || null
    };
};

export const RegistrationService = {
    registerUser,
    setupTutorProfile,
    checkProfileStatus
};
