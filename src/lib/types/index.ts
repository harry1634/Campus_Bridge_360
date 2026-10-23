// Campus Bridge 360 — core domain types
// These mirror the Firestore collections. Timestamps are stored as Firestore
// Timestamps server-side but typed as ISO strings / numbers on the client
// after serialization.

export type UserRole = "student" | "tpo";

export interface UserRecord {
  uid: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export type Department = string; // e.g. "CSE", "IT", "ECE", "EEE", "MECH"

export interface StudentProfile {
  uid: string; // == users/{uid}
  studentId: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;

  // academic
  department: Department;
  batch: string; // e.g. "2024-2028"
  graduationYear: number;
  cgpa: number;
  backlogs: number;

  // career
  skills: string[];
  projects: { title: string; description: string; link?: string }[];
  internships: { company: string; role: string; duration: string; description?: string }[];
  certifications: { name: string; issuer: string; year?: number }[];
  resumeUrl?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;

  // preferences
  preferredRole?: string;
  preferredIndustry?: string;
  preferredLocation?: string;

  createdAt: string;
  updatedAt: string;
}

export interface TpoProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  logoUrl?: string;
  location?: string;
  description?: string;
  createdAt: string;
}

export type WorkMode = "onsite" | "remote" | "hybrid";
export type JobType = "full-time" | "internship" | "internship-ppo" | "contract";
export type JobStatus = "draft" | "published" | "unpublished" | "closed" | "archived";

export interface EligibilityCriteria {
  departments: Department[];
  minCgpa: number;
  maxBacklogs: number;
  batches: string[]; // graduation batches allowed
  graduationYears?: number[];
  otherRequirements?: string;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string; // denormalized for listing
  title: string;
  description: string;
  location: string;
  workMode: WorkMode;
  package: string; // display string e.g. "₹8-12 LPA"
  packageMin?: number;
  packageMax?: number;
  requiredSkills: string[];
  preferredSkills: string[];
  applicationDeadline: string; // ISO date
  driveDate?: string;
  jobType: JobType;
  eligibility: EligibilityCriteria;
  status: JobStatus;
  createdBy: string; // tpo uid
  createdAt: string;
  updatedAt: string;
}

export interface PlacementDrive {
  id: string;
  companyId: string;
  companyName: string;
  jobId?: string;
  jobRole: string;
  package: string;
  driveDate: string;
  location: string;
  workMode: WorkMode;
  eligibility: EligibilityCriteria;
  applicationDeadline: string;
  description: string;
  recruitmentStages: string[]; // e.g. ["Assessment", "Technical Interview", "HR Interview"]
  createdAt: string;
}

export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "assessment"
  | "technical_interview"
  | "hr_interview"
  | "selected"
  | "rejected";

export interface ApplicationStatusEvent {
  status: ApplicationStatus;
  changedAt: string;
  changedBy: string; // uid
  notes?: string;
}

export interface Application {
  id: string;
  jobId: string;
  companyId: string;
  companyName: string;
  studentUid: string;
  studentId: string; // roll number
  studentName: string;
  department: Department;
  cgpa: number;
  status: ApplicationStatus;
  statusHistory: ApplicationStatusEvent[];
  appliedAt: string;
  updatedAt: string;
}

export type InterviewMode = "online" | "in-person";

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  companyId: string;
  studentUid: string;
  round: string; // e.g. "Technical Interview 1"
  date: string;
  time: string;
  mode: InterviewMode;
  meetingLink?: string;
  venue?: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  createdAt: string;
}

export type ExamType = "aptitude" | "coding" | "technical" | "communication" | "other";

export interface PlacementExam {
  id: string;
  name: string;
  companyId?: string;
  companyName?: string;
  date: string;
  time: string;
  durationMinutes: number;
  examType: ExamType;
  platform?: string;
  examLink?: string;
  instructions?: string;
  eligibility: EligibilityCriteria;
  deadline: string;
  createdAt: string;
}

export interface Alumni {
  id: string;
  name: string;
  batch: string;
  department: Department;
  company: string;
  designation: string;
  industry?: string;
  experienceYears?: number;
  skills: string[];
  email?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
  mentorshipAvailable: boolean;
  careerGuidanceAvailable: boolean;
  createdAt: string;
}

export interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  company: string;
  designation: string;
  industry?: string;
  experienceYears?: number;
  skills: string[];
  email?: string;
  phone?: string;
  linkedin?: string;
  availability?: string;
  guidanceAreas: string[];
  createdAt: string;
}

export type MentorshipRequestStatus = "pending" | "accepted" | "declined";

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  studentUid: string;
  studentName: string;
  message: string;
  status: MentorshipRequestStatus;
  createdAt: string;
}

export type PlacementUpdateCategory =
  | "new_drive"
  | "interview_schedule"
  | "assessment"
  | "company_update"
  | "deadline_reminder"
  | "selection_announcement"
  | "notice";

export interface PlacementUpdate {
  id: string;
  title: string;
  body: string;
  category: PlacementUpdateCategory;
  companyId?: string;
  jobId?: string;
  audience: "all" | Department[];
  createdBy: string;
  createdAt: string;
}

export type NotificationType =
  | "new_eligible_job"
  | "application_confirmation"
  | "status_change"
  | "interview_schedule"
  | "placement_exam"
  | "placement_update"
  | "deadline_reminder";

export interface NotificationRecord {
  id: string;
  userUid: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface StudentAcademicRow {
  studentId: string;
  name: string;
  department: string;
  batch: string;
  cgpa: number;
  backlogs: number;
}

export interface ImportError {
  row: number;
  studentId?: string;
  message: string;
}

export interface ImportRecord {
  id: string;
  fileName: string;
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: ImportError[];
  importedBy: string;
  createdAt: string;
}

export interface SkillGapResult {
  skill: string;
  gapPercentage: number;
  studentsHaving: number;
  studentsTotal: number;
}

export interface JobMatch {
  jobId: string;
  jobTitle: string;
  companyName: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  reason: string;
}

export interface ResumeMatchResult {
  jobId: string;
  matchedSkills: string[];
  missingSkills: string[];
  relevantSkills: string[];
  suggestions: string[];
}
