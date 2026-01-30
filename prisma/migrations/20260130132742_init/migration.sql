/*
  Warnings:

  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_parentId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_postId_fkey";

-- DropIndex
DROP INDEX "account_userId_idx";

-- DropIndex
DROP INDEX "session_userId_idx";

-- DropIndex
DROP INDEX "verification_identifier_idx";

-- AlterTable
ALTER TABLE "account" ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "emailVerified" DROP DEFAULT,
ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- DropTable
DROP TABLE "comments";

-- DropTable
DROP TABLE "posts";

-- DropEnum
DROP TYPE "CommentStatus";

-- DropEnum
DROP TYPE "PostStatus";

-- CreateTable
CREATE TABLE "tutor_profiles" (
    "id" SERIAL NOT NULL,
    "bio" TEXT NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "experience" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "studentId" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToTutorProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryToTutorProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tutor_profiles_userId_key" ON "tutor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "_CategoryToTutorProfile_B_index" ON "_CategoryToTutorProfile"("B");

-- AddForeignKey
ALTER TABLE "tutor_profiles" ADD CONSTRAINT "tutor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToTutorProfile" ADD CONSTRAINT "_CategoryToTutorProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToTutorProfile" ADD CONSTRAINT "_CategoryToTutorProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "tutor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
