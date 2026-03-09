src/main/java/edu/tlu/jobplatform/
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: AUTH
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── auth/
│   ├── domain/
│   │   ├── model/
│   │   │   └── AuthToken.java              # Value object: accessToken + refreshToken
│   │   └── service/
│   │       └── PasswordEncoder.java        # Interface (không phụ thuộc BCrypt)
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── LoginUseCase.java
│   │   │   ├── RegisterUseCase.java
│   │   │   ├── RefreshTokenUseCase.java
│   │   │   └── LogoutUseCase.java
│   │   └── port/
│   │       └── out/
│   │           └── TokenStorePort.java     # Interface lưu/xóa refresh token
│   ├── infrastructure/
│   │   ├── security/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── JwtAuthFilter.java
│   │   │   ├── JwtTokenProvider.java
│   │   │   └── UserDetailsServiceImpl.java
│   │   ├── oauth2/
│   │   │   ├── OAuth2UserService.java
│   │   │   └── OAuth2SuccessHandler.java
│   │   └── adapter/
│   │       ├── BCryptPasswordEncoderAdapter.java  # implements PasswordEncoder
│   │       └── RedisTokenStoreAdapter.java        # implements TokenStorePort
│   └── presentation/
│       ├── AuthController.java
│       └── dto/
│           ├── LoginRequest.java
│           ├── RegisterRequest.java
│           └── TokenResponse.java
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: USER
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── user/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── User.java                   # Pure domain object (không @Entity)
│   │   │   └── UserRole.java               # Enum: CANDIDATE, EMPLOYER, ADMIN
│   │   └── repository/
│   │       └── UserRepository.java         # Interface (port ra ngoài)
│   ├── application/
│   │   └── usecase/
│   │       ├── GetCurrentUserUseCase.java
│   │       ├── UpdateUserUseCase.java
│   │       └── DeactivateUserUseCase.java
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── UserJpaEntity.java          # @Entity chỉ ở đây
│   │   │   ├── UserJpaRepository.java      # extends JpaRepository
│   │   │   ├── UserRepositoryAdapter.java  # implements UserRepository (domain)
│   │   │   └── UserMapper.java             # JpaEntity ↔ Domain Model
│   │   └── cache/
│   │       └── UserCacheService.java       # Redis cache user info
│   └── presentation/
│       ├── UserController.java
│       └── dto/
│           ├── UserResponse.java
│           └── UpdateUserRequest.java
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: CANDIDATE
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── candidate/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── CandidateProfile.java       # Aggregate root
│   │   │   ├── CandidateCV.java
│   │   │   ├── WorkExperience.java
│   │   │   ├── Education.java
│   │   │   └── Skill.java                  # Value object
│   │   ├── repository/
│   │   │   ├── CandidateProfileRepository.java
│   │   │   └── CandidateCVRepository.java
│   │   └── service/
│   │       └── CVDomainService.java        # Business rules: validate CV, primary CV logic
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── profile/
│   │   │   │   ├── GetProfileUseCase.java
│   │   │   │   ├── UpdateProfileUseCase.java
│   │   │   │   └── UpdateJobSearchStatusUseCase.java
│   │   │   └── cv/
│   │   │       ├── UploadCVUseCase.java
│   │   │       ├── CreateOnlineCVUseCase.java
│   │   │       ├── SetPrimaryCVUseCase.java
│   │   │       └── DeleteCVUseCase.java
│   │   └── port/
│   │       └── out/
│   │           ├── FileStoragePort.java    # Interface upload file
│   │           └── CVParserPort.java       # Interface parse PDF → text
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── entity/
│   │   │   │   ├── CandidateProfileJpaEntity.java
│   │   │   │   ├── CandidateCVJpaEntity.java
│   │   │   │   ├── WorkExperienceJpaEntity.java
│   │   │   │   └── EducationJpaEntity.java
│   │   │   ├── repository/
│   │   │   │   ├── CandidateProfileJpaRepository.java
│   │   │   │   └── CandidateCVJpaRepository.java
│   │   │   ├── adapter/
│   │   │   │   ├── CandidateProfileRepositoryAdapter.java
│   │   │   │   └── CandidateCVRepositoryAdapter.java
│   │   │   └── mapper/
│   │   │       └── CandidateMapper.java
│   │   ├── file/
│   │   │   ├── S3FileStorageAdapter.java   # implements FileStoragePort
│   │   │   └── ApachePDFParserAdapter.java # implements CVParserPort
│   │   └── event/
│   │       └── CVUploadedEventHandler.java # Lắng nghe, trigger AI embedding
│   └── presentation/
│       ├── CandidateProfileController.java
│       ├── CandidateCVController.java
│       └── dto/
│           ├── request/
│           │   ├── UpdateProfileRequest.java
│           │   ├── CVUploadRequest.java
│           │   └── CreateOnlineCVRequest.java
│           └── response/
│               ├── CandidateProfileResponse.java
│               └── CVResponse.java
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: COMPANY
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── company/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── CompanyProfile.java         # Aggregate root
│   │   │   └── CompanyReview.java
│   │   ├── repository/
│   │   │   ├── CompanyRepository.java
│   │   │   └── CompanyReviewRepository.java
│   │   └── service/
│   │       └── CompanyVerificationService.java  # Business rule xác thực công ty
│   ├── application/
│   │   └── usecase/
│   │       ├── CreateCompanyUseCase.java
│   │       ├── UpdateCompanyUseCase.java
│   │       ├── VerifyCompanyUseCase.java   # Admin use case
│   │       └── ReviewCompanyUseCase.java
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── entity/
│   │   │   ├── repository/
│   │   │   ├── adapter/
│   │   │   └── mapper/
│   │   └── event/
│   │       └── CompanyVerifiedEventHandler.java
│   └── presentation/
│       ├── CompanyController.java
│       ├── CompanyReviewController.java
│       └── dto/
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: SUBSCRIPTION (Business Logic phức tạp nhất)
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── subscription/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── SubscriptionPlan.java       # Value object: tên, giới hạn, giá
│   │   │   ├── CompanySubscription.java    # Aggregate root
│   │   │   ├── Payment.java
│   │   │   └── Quota.java                  # Value object: limit + used
│   │   ├── repository/
│   │   │   ├── SubscriptionPlanRepository.java
│   │   │   ├── CompanySubscriptionRepository.java
│   │   │   └── PaymentRepository.java
│   │   └── service/
│   │       ├── QuotaDomainService.java     # Check + consume quota logic
│   │       └── SubscriptionDomainService.java # Activate, expire, renew
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── GetAvailablePlansUseCase.java
│   │   │   ├── PurchasePlanUseCase.java
│   │   │   ├── CheckQuotaUseCase.java      # Dùng bởi job domain
│   │   │   ├── ConsumeQuotaUseCase.java    # Trừ quota khi đăng bài
│   │   │   └── HandlePaymentCallbackUseCase.java
│   │   └── port/
│   │       └── out/
│   │           └── PaymentGatewayPort.java # Interface thanh toán
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── entity/
│   │   │   ├── repository/
│   │   │   ├── adapter/
│   │   │   └── mapper/
│   │   ├── payment/
│   │   │   ├── VNPayGatewayAdapter.java    # implements PaymentGatewayPort
│   │   │   └── MoMoGatewayAdapter.java
│   │   └── scheduler/
│   │       └── SubscriptionExpiryScheduler.java  # @Scheduled check hết hạn
│   └── presentation/
│       ├── SubscriptionController.java
│       ├── PaymentController.java          # Webhook endpoint
│       └── dto/
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: JOB
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── job/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── JobPost.java                # Aggregate root
│   │   │   ├── JobPostSkill.java
│   │   │   ├── SavedJob.java
│   │   │   └── vo/
│   │   │       ├── Salary.java             # Value object: min, max, currency
│   │   │       ├── JobStatus.java          # Enum với transition rules
│   │   │       └── WorkLocation.java       # Value object
│   │   ├── repository/
│   │   │   ├── JobPostRepository.java
│   │   │   └── SavedJobRepository.java
│   │   └── service/
│   │       └── JobPostDomainService.java   # publish(), close(), expire() logic
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── employer/
│   │   │   │   ├── CreateJobPostUseCase.java    # Check quota → tạo draft
│   │   │   │   ├── UpdateJobPostUseCase.java
│   │   │   │   ├── PublishJobPostUseCase.java   # Consume quota → publish
│   │   │   │   ├── CloseJobPostUseCase.java
│   │   │   │   └── GetMyJobPostsUseCase.java
│   │   │   └── candidate/
│   │   │       ├── SearchJobsUseCase.java
│   │   │       ├── GetJobDetailUseCase.java
│   │   │       ├── SaveJobUseCase.java
│   │   │       └── GetSavedJobsUseCase.java
│   │   └── port/
│   │       └── out/
│   │           ├── QuotaServicePort.java   # Interface gọi subscription domain
│   │           └── JobSearchPort.java      # Interface search (ES hoặc PG)
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── entity/
│   │   │   ├── repository/
│   │   │   ├── adapter/
│   │   │   └── mapper/
│   │   ├── adapter/
│   │   │   └── SubscriptionQuotaAdapter.java  # implements QuotaServicePort
│   │   └── event/
│   │       └── JobEventPublisher.java      # Publish events sau khi job thay đổi
│   └── presentation/
│       ├── JobPostController.java
│       ├── JobSearchController.java
│       ├── SavedJobController.java
│       └── dto/
│           ├── request/
│           │   ├── CreateJobPostRequest.java
│           │   ├── UpdateJobPostRequest.java
│           │   └── JobSearchRequest.java
│           └── response/
│               ├── JobPostResponse.java
│               ├── JobPostDetailResponse.java
│               └── JobSearchResponse.java
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: APPLICATION
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── application/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Application.java            # Aggregate root
│   │   │   ├── ApplicationStatusLog.java
│   │   │   └── vo/
│   │   │       ├── ApplicationStatus.java  # Enum + transition validation
│   │   │       └── AIScore.java            # Value object: score + reasons
│   │   ├── repository/
│   │   │   ├── ApplicationRepository.java
│   │   │   └── ApplicationStatusLogRepository.java
│   │   └── service/
│   │       └── ApplicationDomainService.java  # Status transition rules
│   ├── application/                        # (usecase layer — trùng tên, đặt là 'usecase')
│   │   ├── usecase/
│   │   │   ├── candidate/
│   │   │   │   ├── SubmitApplicationUseCase.java
│   │   │   │   ├── WithdrawApplicationUseCase.java
│   │   │   │   └── GetMyApplicationsUseCase.java
│   │   │   └── employer/
│   │   │       ├── GetApplicationsForJobUseCase.java
│   │   │       ├── UpdateApplicationStatusUseCase.java
│   │   │       └── ScheduleInterviewUseCase.java
│   │   └── port/
│   │       └── out/
│   │           └── AIScorePort.java        # Interface trigger AI scoring
│   ├── infrastructure/
│   │   ├── persistence/
│   │   ├── adapter/
│   │   │   └── AIScoreAdapter.java         # implements AIScorePort → gọi ai domain
│   │   └── event/
│   │       └── ApplicationEventPublisher.java
│   └── presentation/
│       ├── CandidateApplicationController.java
│       ├── EmployerApplicationController.java
│       └── dto/
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: AI
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── ai/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── AIRecommendation.java
│   │   │   ├── ChatSession.java
│   │   │   └── vo/
│   │   │       ├── MatchScore.java         # Value object: score + reasons[]
│   │   │       └── EmbeddingVector.java    # Wrapper cho float[]
│   │   └── repository/
│   │       ├── AIRecommendationRepository.java
│   │       └── ChatSessionRepository.java
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── ScoreCVUseCase.java
│   │   │   ├── GetJobRecommendationsUseCase.java
│   │   │   ├── OptimizeJDUseCase.java
│   │   │   └── ChatUseCase.java
│   │   └── port/
│   │       └── out/
│   │           ├── LLMPort.java            # Interface gọi LLM (OpenAI/Gemini/...)
│   │           └── VectorStorePort.java    # Interface pgvector search
│   ├── infrastructure/
│   │   ├── llm/
│   │   │   ├── OpenAIAdapter.java          # implements LLMPort
│   │   │   └── EmbeddingService.java       # Tạo vector từ text
│   │   ├── vector/
│   │   │   └── PgVectorStoreAdapter.java   # implements VectorStorePort
│   │   ├── persistence/
│   │   ├── batch/
│   │   │   ├── CVEmbeddingBatchJob.java    # Spring Batch
│   │   │   └── RecommendationBatchJob.java
│   │   └── event/
│   │       ├── CVUploadedHandler.java      # Lắng nghe → tạo embedding
│   │       └── JobPublishedHandler.java    # Lắng nghe → tạo jd embedding
│   └── presentation/
│       ├── ChatbotController.java
│       └── dto/
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: SEARCH
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── search/
│   ├── domain/
│   │   └── model/
│   │       ├── SearchQuery.java            # Value object: filters + pagination
│   │       └── SearchResult.java           # Value object: hits + facets
│   ├── application/
│   │   └── usecase/
│   │       └── SearchJobsUseCase.java
│   ├── infrastructure/
│   │   ├── elasticsearch/
│   │   │   ├── JobPostDocument.java        # @Document ES mapping
│   │   │   ├── JobPostESRepository.java
│   │   │   └── ElasticsearchSearchAdapter.java
│   │   └── event/
│   │       └── JobSearchIndexHandler.java  # Lắng nghe JobPublished → sync ES
│   └── presentation/
│       └── SearchController.java
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: NOTIFICATION
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── notification/
│   ├── domain/
│   │   └── model/
│   │       └── Notification.java
│   ├── application/
│   │   ├── usecase/
│   │   │   └── GetNotificationsUseCase.java
│   │   └── port/
│   │       └── out/
│   │           └── EmailPort.java          # Interface gửi email
│   ├── infrastructure/
│   │   ├── email/
│   │   │   └── SendGridEmailAdapter.java   # implements EmailPort
│   │   ├── persistence/
│   │   └── event/
│   │       ├── ApplicationEventHandler.java  # Lắng nghe → gửi notification
│   │       └── PaymentEventHandler.java
│   └── presentation/
│       └── NotificationController.java
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: ADMIN
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── admin/
│   ├── application/
│   │   └── usecase/
│   │       ├── user/
│   │       │   ├── BanUserUseCase.java
│   │       │   └── ListUsersUseCase.java
│   │       ├── company/
│   │       │   ├── VerifyCompanyUseCase.java
│   │       │   └── SuspendCompanyUseCase.java
│   │       ├── job/
│   │       │   ├── ApproveJobPostUseCase.java
│   │       │   └── RejectJobPostUseCase.java
│   │       └── analytics/
│   │           └── GetDashboardStatsUseCase.java
│   └── presentation/
│       ├── AdminUserController.java
│       ├── AdminCompanyController.java
│       ├── AdminJobController.java
│       └── AdminAnalyticsController.java
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  SHARED — Dùng chung toàn app
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
└── shared/
    ├── config/
    │   ├── SecurityConfig.java         # Spring Security global
    │   ├── RedisConfig.java
    │   ├── ElasticsearchConfig.java
    │   ├── SpringAIConfig.java
    │   ├── AsyncConfig.java
    │   ├── OpenAPIConfig.java
    │   └── FlywayConfig.java
    ├── exception/
    │   ├── GlobalExceptionHandler.java # @RestControllerAdvice
    │   ├── DomainException.java        # Base exception
    │   ├── ResourceNotFoundException.java
    │   ├── BusinessRuleException.java
    │   └── QuotaExceededException.java
    ├── event/
    │   ├── DomainEvent.java            # Base class cho tất cả events
    │   │                               # {eventId, occurredAt, correlationId}
    │   ├── candidate/
    │   │   ├── CVUploadedEvent.java
    │   │   └── ProfileUpdatedEvent.java
    │   ├── job/
    │   │   ├── JobPublishedEvent.java
    │   │   ├── JobClosedEvent.java
    │   │   └── JobExpiredEvent.java
    │   ├── application/
    │   │   ├── ApplicationSubmittedEvent.java
    │   │   ├── ApplicationStatusChangedEvent.java
    │   │   └── InterviewScheduledEvent.java
    │   ├── subscription/
    │   │   ├── SubscriptionActivatedEvent.java
    │   │   ├── SubscriptionExpiredEvent.java
    │   │   └── PaymentSuccessEvent.java
    │   └── company/
    │       └── CompanyVerifiedEvent.java
    ├── response/
    │   ├── ApiResponse.java            # {success, data, message, timestamp}
    │   └── PageResponse.java
    ├── validation/
    │   └── PhoneNumberValidator.java   # Custom @ValidPhone annotation
    ├── util/
    │   ├── SlugUtils.java
    │   ├── DateUtils.java
    │   └── PaginationUtils.java
    ├── audit/
    │   ├── AuditLog.java               # @Entity audit_logs
    │   ├── AuditLogRepository.java
    │   └── AuditAspect.java            # @Aspect tự động log
    └── base/
        └── BaseJpaEntity.java          # id, createdAt, updatedAt



        POST /api/applications
         │
         ▼
CandidateApplicationController
         │  parse + validate DTO
         ▼
SubmitApplicationUseCase.execute(command)
         │
         ├─► ApplicationDomainService.validateCanApply()
         │       └── check status, deadline, duplicate
         │
         ├─► ApplicationRepository.save(application)
         │
         └─► ApplicationEventPublisher.publish(
                 ApplicationSubmittedEvent
             )
                      │
         ┌───────────┬┴──────────────┬────────────────┐
         ▼           ▼               ▼                 ▼
  JobEventHandler  AIEventHandler  NotificationHandler AuditHandler
  (tăng count)    (@Async score)   (gửi email)        (log action)