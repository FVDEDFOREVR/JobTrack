import { z } from "zod";

export const WorkExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().trim().min(1, "Company is required"),
  title: z.string().trim().min(1, "Title is required"),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean().default(false),
  bullets: z.array(z.string().trim()).default([]),
  sortOrder: z.number().int().default(0),
});

export const EducationSchema = z.object({
  id: z.string().optional(),
  school: z.string().trim().min(1, "School is required"),
  degree: z.string().trim().nullable().optional(),
  field: z.string().trim().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

export const ResumeProfileSchema = z.object({
  title: z.string().trim().min(1).max(120).nullable().optional(),
  fullName: z.string().trim().nullable().optional(),
  email: z.string().trim().email().nullable().optional().or(z.literal("")),
  phone: z.string().trim().nullable().optional(),
  location: z.string().trim().nullable().optional(),
  linkedinUrl: z.string().trim().url().nullable().optional().or(z.literal("")),
  portfolioUrl: z.string().trim().url().nullable().optional().or(z.literal("")),
  summary: z.string().trim().nullable().optional(),
  rawText: z.string().nullable().optional(),
  sourceFileName: z.string().nullable().optional(),
  sourceFileType: z.string().nullable().optional(),
  sourceFileSize: z.number().int().nullable().optional(),
  hasSourceFile: z.boolean().optional(),
  workExperiences: z.array(WorkExperienceSchema).default([]),
  educations: z.array(EducationSchema).default([]),
  skills: z.array(z.string().trim().min(1)).default([]),
});

export const CommitResumeSchema = ResumeProfileSchema;

export const PatchResumeSchema = ResumeProfileSchema.partial();

export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type ResumeProfile = z.infer<typeof ResumeProfileSchema>;
