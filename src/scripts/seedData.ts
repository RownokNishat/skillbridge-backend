import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import { UserRole } from "../middlewares/auth";

async function seedData() {
    try {
        console.log("***** Data Seeding Started....");

        // 1. Seed Admin
        console.log("Creating Admin...");
        const adminData = {
            name: "Admin User",
            email: "admin@skillbridge.com",
            role: UserRole.ADMIN,
            password: "admin123"
        };

        let admin = await prisma.user.findUnique({
            where: { email: adminData.email }
        });

        if (!admin) {
            const adminRes = await auth.api.signUpEmail({
                body: {
                    email: adminData.email,
                    password: adminData.password,
                    name: adminData.name,
                    role: adminData.role
                } as any
            });

            if (adminRes) {
                await prisma.user.update({
                    where: { email: adminData.email },
                    data: { emailVerified: true }
                });
                admin = await prisma.user.findUnique({
                    where: { email: adminData.email }
                });
                console.log("✓ Admin created successfully");
            }
        } else {
            console.log("✓ Admin already exists");
        }

        // 2. Seed Categories
        console.log("\nCreating Categories...");
        const categoriesData = [
            { name: "Programming", description: "Learn coding and software development" },
            { name: "Mathematics", description: "Master mathematical concepts and problem-solving" },
            { name: "Science", description: "Explore physics, chemistry, and biology" },
            { name: "Languages", description: "Learn new languages and improve communication skills" },
            { name: "Business", description: "Develop business and entrepreneurship skills" },
            { name: "Music", description: "Learn instruments and music theory" },
            { name: "Art & Design", description: "Develop creative and design skills" },
            { name: "Test Prep", description: "Prepare for standardized tests and exams" }
        ];

        const categories = [];
        for (const catData of categoriesData) {
            let category = await prisma.category.findUnique({
                where: { name: catData.name }
            });

            if (!category) {
                category = await prisma.category.create({
                    data: catData
                });
            }
            categories.push(category);
        }
        console.log(`✓ Created ${categories.length} categories`);

        // 3. Seed Tutors
        console.log("\nCreating Tutors...");
        const tutorsData = [
            {
                name: "John Smith",
                email: "john.smith@tutor.com",
                password: "tutor123",
                bio: "Experienced software engineer with 10+ years in web development. Specialized in JavaScript, React, and Node.js.",
                hourlyRate: 50.00,
                experience: 10,
                availability: JSON.stringify({
                    monday: ["09:00-17:00"],
                    wednesday: ["09:00-17:00"],
                    friday: ["09:00-17:00"]
                }),
                categories: ["Programming"]
            },
            {
                name: "Sarah Johnson",
                email: "sarah.johnson@tutor.com",
                password: "tutor123",
                bio: "PhD in Mathematics with 8 years of teaching experience. Expert in calculus, algebra, and statistics.",
                hourlyRate: 45.00,
                experience: 8,
                availability: JSON.stringify({
                    tuesday: ["10:00-18:00"],
                    thursday: ["10:00-18:00"],
                    saturday: ["09:00-15:00"]
                }),
                categories: ["Mathematics"]
            },
            {
                name: "Michael Chen",
                email: "michael.chen@tutor.com",
                password: "tutor123",
                bio: "Physics professor with passion for making science accessible. Specializing in mechanics and electromagnetism.",
                hourlyRate: 55.00,
                experience: 12,
                availability: JSON.stringify({
                    monday: ["14:00-20:00"],
                    wednesday: ["14:00-20:00"],
                    friday: ["14:00-20:00"]
                }),
                categories: ["Science"]
            },
            {
                name: "Emily Rodriguez",
                email: "emily.rodriguez@tutor.com",
                password: "tutor123",
                bio: "Native Spanish speaker and certified language instructor. Teaching Spanish for 6 years.",
                hourlyRate: 40.00,
                experience: 6,
                availability: JSON.stringify({
                    tuesday: ["09:00-17:00"],
                    thursday: ["09:00-17:00"],
                    sunday: ["10:00-16:00"]
                }),
                categories: ["Languages"]
            },
            {
                name: "David Lee",
                email: "david.lee@tutor.com",
                password: "tutor123",
                bio: "MBA graduate and startup founder. Teaching business strategy, marketing, and entrepreneurship.",
                hourlyRate: 60.00,
                experience: 9,
                availability: JSON.stringify({
                    monday: ["18:00-22:00"],
                    wednesday: ["18:00-22:00"],
                    saturday: ["10:00-18:00"]
                }),
                categories: ["Business"]
            },
            {
                name: "Lisa Anderson",
                email: "lisa.anderson@tutor.com",
                password: "tutor123",
                bio: "Professional guitarist and music teacher. Specializing in guitar, music theory, and composition.",
                hourlyRate: 35.00,
                experience: 7,
                availability: JSON.stringify({
                    tuesday: ["15:00-21:00"],
                    thursday: ["15:00-21:00"],
                    saturday: ["12:00-18:00"]
                }),
                categories: ["Music"]
            },
            {
                name: "James Wilson",
                email: "james.wilson@tutor.com",
                password: "tutor123",
                bio: "Professional graphic designer and UX expert. Teaching design principles, Adobe Suite, and Figma.",
                hourlyRate: 48.00,
                experience: 8,
                availability: JSON.stringify({
                    monday: ["10:00-16:00"],
                    wednesday: ["10:00-16:00"],
                    friday: ["10:00-16:00"]
                }),
                categories: ["Art & Design"]
            },
            {
                name: "Maria Garcia",
                email: "maria.garcia@tutor.com",
                password: "tutor123",
                bio: "SAT/ACT prep specialist with 95th percentile scores. Helped 100+ students get into top colleges.",
                hourlyRate: 65.00,
                experience: 5,
                availability: JSON.stringify({
                    tuesday: ["16:00-22:00"],
                    thursday: ["16:00-22:00"],
                    saturday: ["08:00-14:00"]
                }),
                categories: ["Test Prep"]
            }
        ];

        const tutors = [];
        for (const tutorData of tutorsData) {
            let tutor = await prisma.user.findUnique({
                where: { email: tutorData.email }
            });

            if (!tutor) {
                const tutorRes = await auth.api.signUpEmail({
                    body: {
                        email: tutorData.email,
                        password: tutorData.password,
                        name: tutorData.name,
                        role: UserRole.TUTOR
                    } as any
                });

                if (tutorRes) {
                    await prisma.user.update({
                        where: { email: tutorData.email },
                        data: { emailVerified: true }
                    });

                    tutor = await prisma.user.findUnique({
                        where: { email: tutorData.email }
                    });

                    if (tutor) {
                        // Create tutor profile
                        const tutorCategories = categories.filter(cat =>
                            tutorData.categories.includes(cat.name)
                        );

                        await prisma.tutorProfile.create({
                            data: {
                                userId: tutor.id,
                                bio: tutorData.bio,
                                hourlyRate: tutorData.hourlyRate,
                                experience: tutorData.experience,
                                availability: tutorData.availability,
                                categories: {
                                    connect: tutorCategories.map(cat => ({ id: cat.id }))
                                }
                            }
                        });

                        tutors.push(tutor);
                    }
                }
            } else {
                tutors.push(tutor);
            }
        }
        console.log(`✓ Created ${tutors.length} tutors with profiles`);

        // 4. Seed Students
        console.log("\nCreating Students...");
        const studentsData = [
            { name: "Alice Brown", email: "alice.brown@student.com", password: "student123" },
            { name: "Bob Taylor", email: "bob.taylor@student.com", password: "student123" },
            { name: "Charlie Davis", email: "charlie.davis@student.com", password: "student123" },
            { name: "Diana Martin", email: "diana.martin@student.com", password: "student123" },
            { name: "Ethan White", email: "ethan.white@student.com", password: "student123" }
        ];

        const students = [];
        for (const studentData of studentsData) {
            let student = await prisma.user.findUnique({
                where: { email: studentData.email }
            });

            if (!student) {
                const studentRes = await auth.api.signUpEmail({
                    body: {
                        email: studentData.email,
                        password: studentData.password,
                        name: studentData.name,
                        role: UserRole.STUDENT
                    } as any
                });

                if (studentRes) {
                    await prisma.user.update({
                        where: { email: studentData.email },
                        data: { emailVerified: true }
                    });

                    student = await prisma.user.findUnique({
                        where: { email: studentData.email }
                    });

                    if (student) {
                        students.push(student);
                    }
                }
            } else {
                students.push(student);
            }
        }
        console.log(`✓ Created ${students.length} students`);

        // 5. Seed Bookings
        console.log("\nCreating Bookings...");
        const bookingsData = [
            {
                studentIndex: 0,
                tutorIndex: 0,
                startTime: new Date("2026-02-10T10:00:00Z"),
                endTime: new Date("2026-02-10T11:00:00Z"),
                status: "CONFIRMED"
            },
            {
                studentIndex: 0,
                tutorIndex: 1,
                startTime: new Date("2026-02-12T14:00:00Z"),
                endTime: new Date("2026-02-12T15:00:00Z"),
                status: "CONFIRMED"
            },
            {
                studentIndex: 1,
                tutorIndex: 0,
                startTime: new Date("2026-02-08T10:00:00Z"),
                endTime: new Date("2026-02-08T11:00:00Z"),
                status: "COMPLETED"
            },
            {
                studentIndex: 1,
                tutorIndex: 2,
                startTime: new Date("2026-02-15T16:00:00Z"),
                endTime: new Date("2026-02-15T17:00:00Z"),
                status: "PENDING"
            },
            {
                studentIndex: 2,
                tutorIndex: 3,
                startTime: new Date("2026-02-11T11:00:00Z"),
                endTime: new Date("2026-02-11T12:00:00Z"),
                status: "CONFIRMED"
            },
            {
                studentIndex: 2,
                tutorIndex: 4,
                startTime: new Date("2026-02-05T19:00:00Z"),
                endTime: new Date("2026-02-05T20:00:00Z"),
                status: "COMPLETED"
            },
            {
                studentIndex: 3,
                tutorIndex: 5,
                startTime: new Date("2026-02-14T15:00:00Z"),
                endTime: new Date("2026-02-14T16:00:00Z"),
                status: "CONFIRMED"
            },
            {
                studentIndex: 3,
                tutorIndex: 6,
                startTime: new Date("2026-02-07T12:00:00Z"),
                endTime: new Date("2026-02-07T13:00:00Z"),
                status: "COMPLETED"
            },
            {
                studentIndex: 4,
                tutorIndex: 7,
                startTime: new Date("2026-02-13T17:00:00Z"),
                endTime: new Date("2026-02-13T18:00:00Z"),
                status: "CONFIRMED"
            },
            {
                studentIndex: 4,
                tutorIndex: 1,
                startTime: new Date("2026-02-06T15:00:00Z"),
                endTime: new Date("2026-02-06T16:00:00Z"),
                status: "COMPLETED"
            }
        ];

        let bookingsCreated = 0;
        for (const bookingData of bookingsData) {
            if (students[bookingData.studentIndex] && tutors[bookingData.tutorIndex]) {
                const existingBooking = await prisma.booking.findFirst({
                    where: {
                        studentId: students[bookingData.studentIndex]!.id,
                        tutorId: tutors[bookingData.tutorIndex]!.id,
                        startTime: bookingData.startTime
                    }
                });

                if (!existingBooking) {
                    await prisma.booking.create({
                        data: {
                            studentId: students[bookingData.studentIndex]!.id,
                            tutorId: tutors[bookingData.tutorIndex]!.id,
                            startTime: bookingData.startTime,
                            endTime: bookingData.endTime,
                            status: bookingData.status as any
                        }
                    });
                    bookingsCreated++;
                }
            }
        }
        console.log(`✓ Created ${bookingsCreated} bookings`);

        // 6. Seed Reviews (only for completed bookings)
        console.log("\nCreating Reviews...");
        const reviewsData = [
            {
                studentIndex: 1,
                tutorIndex: 0,
                rating: 5,
                comment: "Excellent tutor! Very patient and explained concepts clearly. Highly recommend!"
            },
            {
                studentIndex: 2,
                tutorIndex: 4,
                rating: 5,
                comment: "Great insights into business strategy. David helped me understand complex concepts easily."
            },
            {
                studentIndex: 3,
                tutorIndex: 6,
                rating: 4,
                comment: "Very knowledgeable about design principles. Would book again!"
            },
            {
                studentIndex: 4,
                tutorIndex: 1,
                rating: 5,
                comment: "Sarah made math fun! I finally understand calculus. Best tutor ever!"
            }
        ];

        let reviewsCreated = 0;
        for (const reviewData of reviewsData) {
            if (students[reviewData.studentIndex] && tutors[reviewData.tutorIndex]) {
                const existingReview = await prisma.review.findFirst({
                    where: {
                        studentId: students[reviewData.studentIndex]!.id,
                        tutorId: tutors[reviewData.tutorIndex]!.id
                    }
                });

                if (!existingReview) {
                    await prisma.review.create({
                        data: {
                            studentId: students[reviewData.studentIndex]!.id,
                            tutorId: tutors[reviewData.tutorIndex]!.id,
                            rating: reviewData.rating,
                            comment: reviewData.comment
                        }
                    });
                    reviewsCreated++;
                }
            }
        }
        console.log(`✓ Created ${reviewsCreated} reviews`);

        console.log("\n***** Data Seeding Completed Successfully! *****");
        console.log("\n📊 Summary:");
        console.log(`- Admin: 1 user`);
        console.log(`- Categories: ${categories.length}`);
        console.log(`- Tutors: ${tutors.length}`);
        console.log(`- Students: ${students.length}`);
        console.log(`- Bookings: ${bookingsCreated}`);
        console.log(`- Reviews: ${reviewsCreated}`);
        console.log("\n🔐 Login Credentials:");
        console.log("Admin: admin@skillbridge.com / admin123");
        console.log("Tutors: [tutor-email] / tutor123");
        console.log("Students: [student-email] / student123");

    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedData();
