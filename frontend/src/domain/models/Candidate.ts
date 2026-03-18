// ─── Enums ────────────────────────────────────────────────────────────────────

export type JobSearchStatus = "ACTIVELY_LOOKING" | "OPEN_TO_OFFERS" | "NOT_LOOKING";
export type CVType          = "UPLOADED" | "ONLINE";
export type SkillLevel      = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type Degree          = "BACHELOR" | "MASTER" | "PHD" | "OTHER";

// ─── Skill ────────────────────────────────────────────────────────────────────

export interface Skill {
  name:       string;
  level:      SkillLevel | string;
  yearsOfExp: number;
}

// ─── Work Experience ──────────────────────────────────────────────────────────

export interface WorkExperience {
  id:          string;
  companyName: string;
  position:    string;
  description: string | null;
  startDate:   string;       // ISO date: "2022-01-01"
  endDate:     string | null;
  current:     boolean;
}

// ─── Education ────────────────────────────────────────────────────────────────

export interface Education {
  id:          string;
  school:      string;
  major:       string | null;
  degree:      Degree | string;
  startDate:   string;
  endDate:     string | null;
  description: string | null;
}

// ─── Candidate Profile ────────────────────────────────────────────────────────

export interface CandidateProfile {
  id:              string;
  userId:          string;
  headline:        string | null;
  summary:         string | null;
  phone:           string | null;
  location:        string | null;
  avatarUrl:       string | null;
  dateOfBirth:     string | null;   // ISO date
  gender:          string | null;
  jobSearchStatus: JobSearchStatus | null;
  expectedSalary:  number;
  currency:        string;
  skills:          Skill[];
  experiences:     WorkExperience[];
  educations:      Education[];
  createdAt:       string;
  updatedAt:       string;
}

// ─── CV ───────────────────────────────────────────────────────────────────────

export interface CandidateCV {
  id:         string;
  title:      string;
  type:       CVType;
  fileUrl:    string | null;
  primary:    boolean;
  hasContent: boolean;
  createdAt:  string;
  updatedAt:  string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface UpdateCandidateProfileRequest {
  headline?:       string;
  summary?:        string;
  phone?:          string;
  location?:       string;
  dateOfBirth?:    string;
  gender?:         string;
  expectedSalary?: number;
  currency?:       string;
  skills?:         Skill[];
}

export interface UpdateJobSearchStatusRequest {
  status: JobSearchStatus;
}

export interface CreateOnlineCVRequest {
  title:    string;
  content?: string;
}