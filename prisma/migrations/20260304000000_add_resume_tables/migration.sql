-- CreateTable
CREATE TABLE "ResumeProfile" (
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "linkedinUrl" TEXT,
    "portfolioUrl" TEXT,
    "summary" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "ResumeWorkExperience" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "bulletsJson" JSONB NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ResumeWorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeEducation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT,
    "field" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ResumeEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,

    CONSTRAINT "ResumeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResumeWorkExperience_userId_idx" ON "ResumeWorkExperience"("userId");

-- CreateIndex
CREATE INDEX "ResumeEducation_userId_idx" ON "ResumeEducation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeSkill_userId_skill_key" ON "ResumeSkill"("userId", "skill");

-- CreateIndex
CREATE INDEX "ResumeSkill_userId_idx" ON "ResumeSkill"("userId");

-- AddForeignKey
ALTER TABLE "ResumeWorkExperience" ADD CONSTRAINT "ResumeWorkExperience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ResumeProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeEducation" ADD CONSTRAINT "ResumeEducation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ResumeProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSkill" ADD CONSTRAINT "ResumeSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ResumeProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
