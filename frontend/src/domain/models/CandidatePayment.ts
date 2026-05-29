export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface SubscriptionSummary {
  planCode:              string;
  planName:              string;
  planDescription:       string;
  priceMonthly:          number;
  priceYearly:           number;
  durationDays:          number;
  applicationLimit:      number;
  cvBoostLimit:          number;
  cvCreateLimit:         number;
  aiCvWriter:            boolean;
  premiumTemplateAccess: boolean;
}

export interface CandidatePayment {
  id:                   string;
  companyId:            string | null;
  candidateId:          string | null;
  subscriptionId:       string;
  planCode:             string;
  amount:               number;
  currency:             string;
  amountFormatted:      string;
  gateway:              string;
  gatewayOrderCode:     string;
  gatewayTransactionId: string;
  status:               PaymentStatus;
  statusLabel:          string;
  statusColor:          string;
  failureReason:        string | null;
  createdAt:            string;
  completedAt:          string | null;
  subscription:         SubscriptionSummary | null;
}

export interface PaymentListResponse {
  content:       CandidatePayment[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
  first:         boolean;
  last:          boolean;
  empty:         boolean;
}