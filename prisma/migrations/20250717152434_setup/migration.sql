-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('Queued', 'Processing', 'Complete', 'Error');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "institution" TEXT,
    "purpose" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jobs" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "gridSizeX" INTEGER NOT NULL,
    "gridSizeY" INTEGER NOT NULL,
    "gridSizeZ" INTEGER NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'Queued',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "centerX" DOUBLE PRECISION NOT NULL,
    "centerY" DOUBLE PRECISION NOT NULL,
    "centerZ" DOUBLE PRECISION NOT NULL,
    "energyRange" INTEGER NOT NULL,
    "exhaustiveness" INTEGER NOT NULL,
    "numModes" INTEGER NOT NULL,
    "verbosity" INTEGER NOT NULL,

    CONSTRAINT "Jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceptorFile" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "filePath" VARCHAR(255) NOT NULL,
    "uploadedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileSize" INTEGER NOT NULL,

    CONSTRAINT "ReceptorFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultParameters" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "gridSizeX" TEXT NOT NULL,
    "gridSizeY" TEXT NOT NULL,
    "gridSizeZ" TEXT NOT NULL,
    "centerX" TEXT NOT NULL,
    "centerY" TEXT NOT NULL,
    "centerZ" TEXT NOT NULL,
    "numModes" TEXT NOT NULL,
    "energyRange" TEXT NOT NULL,
    "verbosity" TEXT NOT NULL,
    "exhaustiveness" TEXT NOT NULL,
    "updatedBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DefaultParameters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_key" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionId_key" ON "Session"("sessionId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jobs" ADD CONSTRAINT "Jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
