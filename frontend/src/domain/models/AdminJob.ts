export type JobStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'CLOSED'
  | 'PENDING_REVIEW'
  | 'EXPIRED'
  | 'DELETED';

// ─── List item (từ /search) 
export interface AdminJob {
  id:               string;
  companyId:        string;
  companyName:      string | null;
  companyLogoUrl:   string | null;
  title:            string;
  slug:             string;
  jobType:          string | null;
  level:            string | null;
  category:         string | null;
  salaryDisplay:    string | null;
  workLocationType: string | null;
  workLocationCity: string | null;
  experienceYears:  number | null;
  vacancies:        number | null;
  deadline:         string | null;
  status:           JobStatus;
  viewCount:        number;
  applicationCount: number;
  featured:         boolean;
  publishedAt:      string | null;
  createdAt:        string;
  updatedAt:        string | null;
  rejectionReason:  string | null;
}

// ─── Skill item ────────────
export interface JobSkill {
  skillName: string;
  level:     string;
  required:  boolean;
}

// ─── Competition breakdown ─
export interface CompetitionBreakdown {
  applicantRatioScore:  number;
  poolQualityScore:     number;
  jobPopularityScore:   number;
  entryBarrierScore:    number;
  urgencyScore:         number;
}

export interface CompetitionDetail {
  competitionScore:         number;
  level:                    string;
  trend:                    string;
  totalApplicants:          number;
  averageAIScore:           number;
  hiringQuota:              number;
  applicationToHiringRatio: number;
  breakdown:                CompetitionBreakdown;
  candidateAdvice:          string;
  employerInsight:          string;
}

// ─── Detail item (từ /{id}) 
export interface AdminJobDetail extends AdminJob {
  postedBy:              string | null;
  description:           string | null;
  requirements:          string | null;
  benefits:              string | null;
  salaryNegotiable:      boolean;
  workLocationAddress:   string | null;
  acceptingApplications: boolean;
  skills:                JobSkill[];
  companyIndustry:       string | null;
  companySize:           string | null;
  companyWebsite:        string | null;
  competition:           CompetitionDetail | null;
}

// ─── Filters & pagination ──
export interface AdminJobPage {
  content:       AdminJob[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
}

export interface AdminJobFilters {
  status?:   JobStatus | '';
  keyword?:  string;
  city?:     string;
  category?: string;
  page:      number;
  size:      number;
}