/*
  Warnings:

  - Added the required column `actoken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rftoken` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "actoken" TEXT NOT NULL,
ADD COLUMN     "rftoken" TEXT NOT NULL;
