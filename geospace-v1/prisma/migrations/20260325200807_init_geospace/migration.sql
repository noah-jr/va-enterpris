-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPERACIONAL',
    "sector" TEXT NOT NULL,
    "agentsCount" INTEGER NOT NULL DEFAULT 0,
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Road" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "geometry" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOA',
    "length" TEXT,
    "maxSpeed" INTEGER NOT NULL DEFAULT 60,
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DensityPoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "densityValue" INTEGER NOT NULL DEFAULT 0,
    "populationCount" INTEGER NOT NULL DEFAULT 0,
    "classification" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "location" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "description" TEXT,
    "reporterId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Incident_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrafficUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roadId" TEXT NOT NULL,
    "avgSpeed" INTEGER NOT NULL,
    "vehicles" INTEGER NOT NULL,
    "delay" TEXT,
    "status" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_code_key" ON "Unit"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Road_code_key" ON "Road"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Incident_code_key" ON "Incident"("code");
