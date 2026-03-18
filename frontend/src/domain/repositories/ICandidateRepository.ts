import {
  UpdateProfilePayload,
  UploadCVPayload,
} from "@/application/services/CandidateService";
import {
  CandidateProfile,
  CandidateCV,
  JobSearchStatus,
} from "@/domain/models/Candidate";

export interface ICandidateRepository {
  // Profile
  getProfile():                                      Promise<CandidateProfile>;
  updateProfile(data: UpdateProfilePayload):         Promise<CandidateProfile>;
  updateJobSearchStatus(status: JobSearchStatus):    Promise<void>;

  // CV
  listCVs():                                         Promise<CandidateCV[]>;
  uploadCV(data: UploadCVPayload):                   Promise<CandidateCV>;
  setPrimaryCV(cvId: string):                        Promise<void>;
  deleteCV(cvId: string):                            Promise<void>;
}