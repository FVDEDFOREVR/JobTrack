import { normalizeDate } from "./normalize-date";
import type { ResumeProfile, WorkExperience, Education } from "./schemas";

export interface ParseWarning {
  field: string;
  message: string;
}

export interface ParseResult {
  data: ResumeProfile;
  warnings: ParseWarning[];
}

// Section header patterns
const SECTION_PATTERNS: Record<string, RegExp> = {
  experience: /^(work\s+)?experience|employment(\s+history)?|professional\s+background/i,
  education:  /^education(\s+&\s+training)?|academic\s+background/i,
  skills:     /^(technical\s+)?skills|core\s+competencies|technologies/i,
  summary:    /^(professional\s+)?summary|profile|objective|about\s+me/i,
};

function splitLines(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.trim());
}

function extractEmail(text: string): string | null {
  const m = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  return m ? m[0] : null;
}

function extractPhone(text: string): string | null {
  const m = text.match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  return m ? m[0] : null;
}

function extractLinkedIn(text: string): string | null {
  const m = text.match(/linkedin\.com\/in\/[\w-]+/i);
  return m ? `https://${m[0]}` : null;
}

function extractPortfolio(text: string): string | null {
  const m = text.match(/https?:\/\/(?!linkedin)[\w.-]+\.[a-z]{2,}(\/[\w./?=#%-]*)?/i);
  return m ? m[0] : null;
}

function detectSectionStart(line: string): string | null {
  for (const [key, re] of Object.entries(SECTION_PATTERNS)) {
    if (re.test(line)) return key;
  }
  return null;
}

// Date range pattern: "Jan 2020 – Present" or "2019 - 2021"
const DATE_RANGE_RE = /([A-Za-z]+\.?\s+\d{4}|\d{4})\s*[-–—]\s*([A-Za-z]+\.?\s+\d{4}|\d{4}|present|current)/i;

function parseExperienceBlock(lines: string[]): { experiences: WorkExperience[]; warnings: ParseWarning[] } {
  const experiences: WorkExperience[] = [];
  const warnings: ParseWarning[] = [];
  let current: Partial<WorkExperience> | null = null;
  let sortOrder = 0;

  const flush = () => {
    if (current?.company && current?.title) {
      experiences.push({
        company: current.company,
        title: current.title,
        startDate: current.startDate ?? null,
        endDate: current.endDate ?? null,
        isCurrent: current.isCurrent ?? false,
        bullets: current.bullets ?? [],
        sortOrder: sortOrder++,
      });
    } else if (current) {
      warnings.push({ field: "workExperience", message: `Incomplete entry skipped: ${JSON.stringify(current)}` });
    }
    current = null;
  };

  for (const line of lines) {
    if (!line) continue;

    const dateMatch = line.match(DATE_RANGE_RE);
    if (dateMatch) {
      if (!current) current = { bullets: [] };
      current.startDate = normalizeDate(dateMatch[1]);
      const endRaw = dateMatch[2];
      current.isCurrent = /present|current/i.test(endRaw);
      current.endDate = current.isCurrent ? null : normalizeDate(endRaw);
      continue;
    }

    // Bullet point
    if (/^[•\-*▪▸►]\s+/.test(line)) {
      if (!current) current = { bullets: [] };
      current.bullets = current.bullets ?? [];
      current.bullets.push(line.replace(/^[•\-*▪▸►]\s+/, "").trim());
      continue;
    }

    // Likely a job title / company line (short, no punctuation at end)
    if (line.length < 80 && !/[.!?]$/.test(line)) {
      if (current && !current.title) {
        current.title = line;
      } else if (current && !current.company) {
        current.company = line;
      } else {
        flush();
        current = { title: line, bullets: [] };
      }
    }
  }
  flush();
  return { experiences, warnings };
}

function parseEducationBlock(lines: string[]): { educations: Education[]; warnings: ParseWarning[] } {
  const educations: Education[] = [];
  const warnings: ParseWarning[] = [];
  let current: Partial<Education> | null = null;
  let sortOrder = 0;

  const flush = () => {
    if (current?.school) {
      educations.push({
        school: current.school,
        degree: current.degree ?? null,
        field: current.field ?? null,
        startDate: current.startDate ?? null,
        endDate: current.endDate ?? null,
        sortOrder: sortOrder++,
      });
    }
    current = null;
  };

  for (const line of lines) {
    if (!line) continue;

    const dateMatch = line.match(DATE_RANGE_RE);
    if (dateMatch) {
      if (!current) current = {};
      current.startDate = normalizeDate(dateMatch[1]);
      const endRaw = dateMatch[2];
      current.endDate = /present|current/i.test(endRaw) ? null : normalizeDate(endRaw);
      continue;
    }

    // Degree keywords
    if (/\b(bachelor|master|phd|doctorate|associate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?b\.?a\.?)\b/i.test(line)) {
      if (!current) current = {};
      current.degree = line;
      continue;
    }

    if (line.length < 80) {
      if (current && !current.school) {
        current.school = line;
      } else {
        flush();
        current = { school: line };
      }
    }
  }
  flush();
  return { educations, warnings };
}

function parseSkillsBlock(lines: string[]): string[] {
  const skills: string[] = [];
  for (const line of lines) {
    // Split on commas, pipes, bullets
    const parts = line.split(/[,|•·]\s*/);
    for (const p of parts) {
      const s = p.replace(/^[•\-*▪▸►]\s+/, "").trim();
      if (s && s.length < 60) skills.push(s);
    }
  }
  return [...new Set(skills)];
}

export function parseResumeText(text: string): ParseResult {
  const warnings: ParseWarning[] = [];
  const lines = splitLines(text);

  // Extract basics from first ~20 lines
  const headerText = lines.slice(0, 20).join("\n");
  const email = extractEmail(headerText);
  const phone = extractPhone(headerText);
  const linkedinUrl = extractLinkedIn(text);
  const portfolioUrl = extractPortfolio(text);

  // Full name heuristic: first non-empty line that looks like a name
  let fullName: string | null = null;
  for (const line of lines.slice(0, 5)) {
    if (line && /^[A-Z][a-z]+ [A-Z]/.test(line) && line.length < 50) {
      fullName = line;
      break;
    }
  }
  if (!fullName) warnings.push({ field: "fullName", message: "Could not detect full name" });

  // Split text into sections
  const sections: Record<string, string[]> = {
    experience: [],
    education: [],
    skills: [],
    summary: [],
  };
  let currentSection: string | null = null;

  for (const line of lines) {
    const detected = detectSectionStart(line);
    if (detected) {
      currentSection = detected;
      continue;
    }
    if (currentSection) {
      sections[currentSection].push(line);
    }
  }

  const { experiences, warnings: expWarnings } = parseExperienceBlock(sections.experience);
  const { educations, warnings: eduWarnings } = parseEducationBlock(sections.education);
  const skills = parseSkillsBlock(sections.skills);
  const summary = sections.summary.filter(Boolean).join(" ").trim() || null;

  warnings.push(...expWarnings, ...eduWarnings);

  if (experiences.length === 0) warnings.push({ field: "workExperience", message: "No work experience detected" });
  if (educations.length === 0) warnings.push({ field: "education", message: "No education detected" });
  if (skills.length === 0) warnings.push({ field: "skills", message: "No skills detected" });

  return {
    data: {
      fullName,
      email,
      phone,
      location: null,
      linkedinUrl,
      portfolioUrl,
      summary,
      workExperiences: experiences,
      educations,
      skills,
    },
    warnings,
  };
}
