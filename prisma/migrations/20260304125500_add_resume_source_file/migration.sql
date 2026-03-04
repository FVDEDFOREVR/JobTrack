ALTER TABLE "ResumeProfile"
  ADD COLUMN "sourceFileName" TEXT,
  ADD COLUMN "sourceFileType" TEXT,
  ADD COLUMN "sourceFileSize" INTEGER,
  ADD COLUMN "sourceFileData" BYTEA;
