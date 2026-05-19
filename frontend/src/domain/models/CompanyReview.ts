// D:\TLU_JOB_PLATFORM\frontend\src\domain\models\CompanyReview.ts

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';

export interface CompanyReview {
  id: string;
  companyId: string;
  reviewerName: string;
  rating: number;
  title: string;
  content: string;
  pros: string;
  cons: string;
  anonymous: boolean;
  employed: boolean;
  status: ReviewStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}

export interface ReviewListResponse {
  stats: ReviewStats;
  reviews: PageResponse<CompanyReview>;
}

export interface CreateReviewRequest {
  rating: number;
  title: string;
  content: string;
  pros?: string;
  cons?: string;
  anonymous: boolean;
  employed: boolean;
}

export interface UpdateReviewRequest {
  rating: number;
  title: string;
  content: string;
  pros?: string;
  cons?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}