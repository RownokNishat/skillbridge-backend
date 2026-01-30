import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import { UserRole } from "../middlewares/auth";

async function seedAdmin() {
    try {
        console.log("***** Admin Seeding Started....");
        const adminData = {
            name: "Admin",
            email: "admin@skillbridge.com",
            role: UserRole.ADMIN,
            password: "admin123"
        };
        
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        });

        if (existingUser) {
            console.log("Admin already exists!");
            return;
        }

        const res = await auth.api.signUpEmail({
            body: {
                email: adminData.email,
                password: adminData.password,
                name: adminData.name,
                role: adminData.role
            }
        });

        if (res) {
             console.log("******* Admin created successfully ******");
             // Manually verify email
             await prisma.user.update({
                 where: { email: adminData.email },
                 data: { emailVerified: true }
             });
             console.log("******* Admin verified successfully ******");
        }

    } catch (error) {
        console.error(error);
    }
}

seedAdmin();