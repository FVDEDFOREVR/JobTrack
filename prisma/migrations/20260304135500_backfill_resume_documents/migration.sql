INSERT INTO "ResumeDocument" (
  "id",
  "userId",
  "title",
  "fullName",
  "rawText",
  "sourceFileName",
  "sourceFileType",
  "sourceFileSize",
  "sourceFileData",
  "createdAt",
  "updatedAt"
)
SELECT
  ('legacy-' || rp."userId")::text,
  rp."userId",
  COALESCE(NULLIF(rp."fullName", ''), NULLIF(rp."sourceFileName", ''), 'Imported Resume') AS "title",
  rp."fullName",
  rp."rawText",
  rp."sourceFileName",
  rp."sourceFileType",
  rp."sourceFileSize",
  rp."sourceFileData",
  NOW(),
  NOW()
FROM "ResumeProfile" rp
WHERE (rp."rawText" IS NOT NULL OR rp."sourceFileData" IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1 FROM "ResumeDocument" rd WHERE rd."userId" = rp."userId"
  );
