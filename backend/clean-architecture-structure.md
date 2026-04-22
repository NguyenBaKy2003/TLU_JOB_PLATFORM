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
│  DOMAIN: EMPLOYER
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
│  DOMAIN: MESSAGE  (Chat / Inbox)
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── message/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Conversation.java           # Aggregate root
│   │   │   │                               # {id, participantA, participantB,
│   │   │   │                               #  jobPostId?, lastMessageAt, unreadCount}
│   │   │   ├── Message.java                # Entity trong Conversation
│   │   │   │                               # {id, conversationId, senderId,
│   │   │   │                               #  content, type, readAt, createdAt}
│   │   │   └── vo/
│   │   │       ├── MessageType.java        # Enum: TEXT, FILE, SYSTEM
│   │   │       └── ConversationStatus.java # Enum: ACTIVE, ARCHIVED, BLOCKED
│   │   ├── repository/
│   │   │   ├── ConversationRepository.java
│   │   │   └── MessageRepository.java
│   │   └── service/
│   │       └── ConversationDomainService.java
│   │           # canSendMessage() — kiểm tra block, trạng thái job
│   │           # markAsRead(conversationId, userId)
│   ├── application/
│   │   └── usecase/
│   │       ├── StartConversationUseCase.java
│   │       │   # Employer mở conversation từ một job post
│   │       │   # Candidate reply lại
│   │       ├── SendMessageUseCase.java
│   │       ├── GetConversationsUseCase.java  # Inbox list
│   │       ├── GetMessagesUseCase.java       # Message thread
│   │       └── MarkReadUseCase.java
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── entity/
│   │   │   │   ├── ConversationJpaEntity.java
│   │   │   │   └── MessageJpaEntity.java
│   │   │   ├── repository/
│   │   │   │   ├── ConversationJpaRepository.java
│   │   │   │   └── MessageJpaRepository.java
│   │   │   ├── adapter/
│   │   │   │   ├── ConversationRepositoryAdapter.java
│   │   │   │   └── MessageRepositoryAdapter.java
│   │   │   └── mapper/
│   │   │       └── MessageMapper.java
│   │   └── event/
│   │       └── MessageSentEventPublisher.java
│   │           # Publish MessageSentEvent → WebSocket + Notification
│   └── presentation/
│       ├── MessageController.java          # REST: lấy inbox, thread, mark read
│       └── dto/
│           ├── request/
│           │   ├── StartConversationRequest.java
│           │   └── SendMessageRequest.java
│           └── response/
│               ├── ConversationResponse.java
│               └── MessageResponse.java
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: WEBSOCKET  (Real-time delivery)
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── websocket/
│   ├── domain/
│   │   └── model/
│   │       ├── WsSession.java              # Value object
│   │       │                               # {sessionId, userId, connectedAt}
│   │       └── WsPayload.java              # Value object
│   │                                       # {type, data} — envelope chung
│   ├── application/
│   │   └── port/
│   │       └── out/
│   │           └── WsPushPort.java         # Interface gửi message realtime
│   │               # pushToUser(userId, WsPayload)
│   │               # pushToConversation(conversationId, WsPayload)
│   ├── infrastructure/
│   │   ├── config/
│   │   │   └── WebSocketConfig.java
│   │   │       # @EnableWebSocketMessageBroker
│   │   │       # STOMP endpoint: /ws
│   │   │       # Broker relay: /topic, /queue
│   │   │       # App destination prefix: /app
│   │   ├── handler/
│   │   │   └── StompSessionHandler.java
│   │   │       # Lưu sessionId ↔ userId vào Redis khi connect/disconnect
│   │   ├── adapter/
│   │   │   └── StompWsPushAdapter.java     # implements WsPushPort
│   │   │       # Dùng SimpMessagingTemplate.convertAndSendToUser()
│   │   └── event/
│   │       └── MessageSentWsHandler.java
│   │           # @EventListener MessageSentEvent
│   │           # → wsPushPort.pushToConversation(...)
│   │           # → wsPushPort.pushToUser(recipientId, unread badge)
│   └── presentation/
│       └── WsController.java               # @MessageMapping("/chat.send")
│           # Nhận STOMP frame → gọi SendMessageUseCase
│           # (REST + WS đều dùng cùng use case)
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: RATE LIMIT
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
└── ratelimit/
    ├── domain/
    │   ├── model/
    │   │   └── RateLimitPolicy.java        # Value object
    │   │       # {key, maxRequests, windowSeconds, scope}
    │   │       # scope: IP | USER | API_KEY
    │   └── service/
    │       └── RateLimitDomainService.java
    │           # isAllowed(key, policy) → boolean
    │           # remainingRequests(key) → int
    ├── application/
    │   └── port/
    │       └── out/
    │           └── RateLimitStorePort.java # Interface → Redis
    │               # increment(key, windowSeconds) → long (current count)
    │               # ttl(key) → Duration
    ├── infrastructure/
    │   ├── config/
    │   │   └── RateLimitConfig.java
    │   │       # Khai báo policies dưới dạng @ConfigurationProperties
    │   │       # rate-limit.policies.register-otp: {max:5, window:60}
    │   │       # rate-limit.policies.send-message: {max:30, window:60}
    │   │       # rate-limit.policies.job-search:   {max:100, window:60}
    │   ├── adapter/
    │   │   └── RedisRateLimitAdapter.java  # implements RateLimitStorePort
    │   │       # Dùng Redis INCR + EXPIRE (sliding window hoặc fixed window)
    │   └── filter/
    │       └── RateLimitFilter.java        # OncePerRequestFilter
    │           # Đọc policy từ @RateLimit annotation trên controller method
    │           # Trả 429 Too Many Requests + Retry-After header khi vượt giới hạn
    └── presentation/
        └── annotation/
            └── RateLimit.java              # Custom annotation
                # @RateLimit(policy = "send-message", scope = USER)
                # Dùng trên method trong MessageController, AuthController…
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  DOMAIN: CV  (Online CV Builder)
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── cv/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── OnlineCV.java                   # Aggregate root
│   │   │   │   # {id, candidateId, title, templateId,
│   │   │   │   #  personalInfo, sections[], status, visibility,
│   │   │   │   #  slug, viewCount, createdAt, updatedAt}
│   │   │   ├── CVSection.java                  # Entity trong aggregate
│   │   │   │   # {id, type, displayOrder, visible, content}
│   │   │   │   # type: SUMMARY | EXPERIENCE | EDUCATION |
│   │   │   │   #       SKILL | PROJECT | CERTIFICATE |
│   │   │   │   #       LANGUAGE | AWARD | CUSTOM
│   │   │   ├── CVTemplate.java                 # Value object (read-only)
│   │   │   │   # {id, name, thumbnailUrl, category, isPremium}
│   │   │   └── vo/
│   │   │       ├── PersonalInfo.java            # Value object
│   │   │       │   # {fullName, email, phone, address,
│   │   │       │   #  avatarUrl, linkedIn, github, website, headline}
│   │   │       ├── CVStatus.java               # Enum: DRAFT, PUBLISHED, ARCHIVED
│   │   │       ├── CVVisibility.java           # Enum: PRIVATE, PUBLIC, LINK_ONLY
│   │   │       └── SectionContent.java         # Sealed interface / marker
│   │   │           # Các impl: ExperienceContent, EducationContent,
│   │   │           #           SkillContent, ProjectContent,
│   │   │           #           SummaryContent, CustomContent
│   │   ├── repository/
│   │   │   ├── OnlineCVRepository.java         # Port ra ngoài
│   │   │   └── CVTemplateRepository.java
│   │   └── service/
│   │       └── CVDomainService.java
│   │           # validateCanPublish(cv) — kiểm tra đủ thông tin tối thiểu
│   │           # reorderSections(cv, newOrder) — cập nhật displayOrder
│   │           # duplicateCV(cv) → OnlineCV — clone sang draft mới
│   │           # generateSlug(title, candidateId) → String
│   │
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── CreateOnlineCVUseCase.java      # Tạo CV mới từ template
│   │   │   ├── UpdateOnlineCVUseCase.java      # Cập nhật personalInfo, metadata
│   │   │   ├── UpdateCVSectionUseCase.java     # Thêm/sửa/xóa một section
│   │   │   ├── ReorderSectionsUseCase.java     # Kéo thả thứ tự section
│   │   │   ├── PublishCVUseCase.java           # DRAFT → PUBLISHED + sinh slug
│   │   │   ├── ArchiveCVUseCase.java           # PUBLISHED/DRAFT → ARCHIVED
│   │   │   ├── DuplicateCVUseCase.java         # Clone CV hiện tại → draft mới
│   │   │   ├── ExportCVUseCase.java            # Render → PDF file
│   │   │   ├── GetMyCVsUseCase.java            # Danh sách CV của candidate
│   │   │   ├── GetCVDetailUseCase.java         # Chi tiết để edit
│   │   │   ├── GetPublicCVUseCase.java         # Xem public qua slug (không cần auth)
│   │   │   ├── GetCVTemplatesUseCase.java      # Danh sách template
│   │   │   └── ImportFromProfileUseCase.java   # Tự điền từ CandidateProfile
│   │   └── port/
│   │       └── out/
│   │           ├── CVRenderPort.java           # Interface render HTML → PDF
│   │           │   # render(OnlineCV, CVTemplate) → byte[]
│   │           └── CVStoragePort.java          # Interface lưu PDF đã render
│   │               # store(candidateId, cvId, pdfBytes) → String (url)
│   │
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── entity/
│   │   │   │   ├── OnlineCVJpaEntity.java
│   │   │   │   ├── CVSectionJpaEntity.java
│   │   │   │   └── CVTemplateJpaEntity.java
│   │   │   ├── repository/
│   │   │   │   ├── OnlineCVJpaRepository.java
│   │   │   │   └── CVTemplateJpaRepository.java
│   │   │   ├── adapter/
│   │   │   │   ├── OnlineCVRepositoryAdapter.java  # implements OnlineCVRepository
│   │   │   │   └── CVTemplateRepositoryAdapter.java
│   │   │   └── mapper/
│   │   │       └── OnlineCVMapper.java
│   │   ├── render/
│   │   │   ├── ThymeleafCVRenderAdapter.java   # implements CVRenderPort
│   │   │   │   # Render Thymeleaf template → HTML → Flying Saucer → PDF
│   │   │   └── templates/                      # Thymeleaf .html templates
│   │   │       ├── cv-template-classic.html
│   │   │       ├── cv-template-modern.html
│   │   │       └── cv-template-minimal.html
│   │   ├── storage/
│   │   │   └── S3CVStorageAdapter.java         # implements CVStoragePort
│   │   │       # Tái dùng S3FileStorageAdapter của candidate domain
│   │   └── event/
│   │       └── CVPublishedEventPublisher.java
│   │           # Publish CVPublishedEvent khi CV chuyển sang PUBLISHED
│   │
│   └── presentation/
│       ├── OnlineCVController.java             # /api/cv — CRUD + publish + export
│       ├── PublicCVController.java             # /public/cv/{slug} — không cần auth
│       ├── CVTemplateController.java           # /api/cv/templates
│       └── dto/
│           ├── request/
│           │   ├── CreateOnlineCVRequest.java  # {title, templateId}
│           │   ├── UpdateOnlineCVRequest.java  # {title, personalInfo, visibility}
│           │   ├── UpdateCVSectionRequest.java # {type, content, visible}
│           │   ├── ReorderSectionsRequest.java # {sectionIds: []}
│           │   └── ImportFromProfileRequest.java
│           └── response/
│               ├── OnlineCVResponse.java       # Dùng cho list (không có sections)
│               ├── OnlineCVDetailResponse.java # Dùng cho edit (có đầy đủ sections)
│               ├── PublicCVResponse.java       # Dùng cho view public
│               └── CVTemplateResponse.java
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
        ├── WebSocketConfig.java        # (delegate sang websocket/infrastructure/config)
        └── RateLimitConfig.java        # (delegate sang ratelimit/infrastructure/config)
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
            cv/
        ├── CVPublishedEvent.java
        │   # {cvId, candidateId, slug, publishedAt}
        ├── CVExportedEvent.java
        │   # {cvId, candidateId, pdfUrl}
        └── CVViewedEvent.java
            # {cvId, slug, viewerIp} — dùng để tăng viewCount async
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
    ├── message/
│   ├── MessageSentEvent.java
│   │   # {conversationId, senderId, recipientId, messageId, preview}
│   └── ConversationStartedEvent.java
└── websocket/
    ├── WsConnectedEvent.java
    └── WsDisconnectedEvent.java


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

POST /api/cv/{cvId}/export
         │
         ▼
OnlineCVController
         │  extract cvId, check ownership
         ▼
ExportCVUseCase.execute(cvId, candidateId)
         │
         ├─► OnlineCVRepository.findById(cvId)
         │       └── check ownership + status != ARCHIVED
         │
         ├─► CVTemplateRepository.findById(cv.templateId)
         │
         ├─► CVRenderPort.render(cv, template)
         │       └── ThymeleafCVRenderAdapter
         │               ├── render HTML từ template .html
         │               └── Flying Saucer → byte[] PDF
         │
         ├─► CVStoragePort.store(candidateId, cvId, pdfBytes)
         │       └── S3CVStorageAdapter → trả về pdfUrl
         │
         └─► ApplicationEventPublisher.publish(CVExportedEvent)