CREATE TABLE "ResumeDocument" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "fullName" TEXT,
  "rawText" TEXT,
  "sourceFileName" TEXT,
  "sourceFileType" TEXT,
  "sourceFileSize" INTEGER,
  "sourceFileData" BYTEA,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResumeDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ResumeDocument_userId_idx" ON "ResumeDocument"("userId");
CREATE INDEX "ResumeDocument_createdAt_idx" ON "ResumeDocument"("createdAt");
