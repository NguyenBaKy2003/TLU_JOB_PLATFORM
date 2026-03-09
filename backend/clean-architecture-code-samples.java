// ════════════════════════════════════════════════════════════════
// LAYER 1: DOMAIN
// ════════════════════════════════════════════════════════════════

// ── domain/valueobject/Salary.java ──────────────────────────────
package com.jobplatform.domain.valueobject;

import com.jobplatform.domain.exception.DomainException;
import java.math.BigDecimal;

public record Salary(
    BigDecimal min,
    BigDecimal max,
    String currency,
    boolean negotiable
) {
    public Salary {
        if (!negotiable) {
            if (min != null && min.compareTo(BigDecimal.ZERO) < 0)
                throw new DomainException("Lương tối thiểu không được âm");
            if (min != null && max != null && max.compareTo(min) < 0)
                throw new DomainException("Lương tối đa phải >= lương tối thiểu");
        }
    }

    public static Salary negotiable() {
        return new Salary(null, null, "VND", true);
    }

    public static Salary of(BigDecimal min, BigDecimal max) {
        return new Salary(min, max, "VND", false);
    }

    public boolean isInRange(BigDecimal expected) {
        if (negotiable) return true;
        if (min != null && expected.compareTo(min) < 0) return false;
        if (max != null && expected.compareTo(max) > 0) return false;
        return true;
    }
}


// ── domain/valueobject/Email.java ───────────────────────────────
package com.jobplatform.domain.valueobject;

import com.jobplatform.domain.exception.DomainException;

public record Email(String value) {
    public Email {
        if (value == null || !value.matches("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$"))
            throw new DomainException("Email không hợp lệ: " + value);
        value = value.toLowerCase().trim();
    }
}


// ── domain/model/job/JobPost.java ────────────────────────────────
package com.jobplatform.domain.model.job;

import com.jobplatform.domain.enums.JobStatus;
import com.jobplatform.domain.exception.DomainException;
import com.jobplatform.domain.valueobject.Salary;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class JobPost {

    private UUID id;
    private UUID companyId;
    private String title;
    private String description;
    private String requirements;
    private Salary salary;
    private JobStatus status;
    private boolean featured;
    private LocalDate deadline;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;

    // ── Factory method ───────────────────────────────────────────
    public static JobPost create(UUID companyId, String title,
                                  String description, Salary salary) {
        JobPost job = new JobPost();
        job.id = UUID.randomUUID();
        job.companyId = companyId;
        job.title = title;
        job.description = description;
        job.salary = salary;
        job.status = JobStatus.DRAFT;
        job.createdAt = LocalDateTime.now();
        return job;
    }

    // ── Business Rules ───────────────────────────────────────────
    public void submit() {
        if (status != JobStatus.DRAFT)
            throw new DomainException("Chỉ có thể submit bài ở trạng thái DRAFT");
        if (title == null || title.isBlank())
            throw new DomainException("Tiêu đề bài đăng không được trống");
        this.status = JobStatus.PENDING_REVIEW;
    }

    public void publish() {
        if (status != JobStatus.PENDING_REVIEW)
            throw new DomainException("Chỉ có thể publish bài đã qua review");
        this.status = JobStatus.PUBLISHED;
        this.publishedAt = LocalDateTime.now();
    }

    public void reject(String reason) {
        if (status != JobStatus.PENDING_REVIEW)
            throw new DomainException("Chỉ có thể reject bài đang chờ review");
        this.status = JobStatus.REJECTED;
    }

    public void close() {
        if (status != JobStatus.PUBLISHED)
            throw new DomainException("Chỉ có thể đóng bài đang published");
        this.status = JobStatus.CLOSED;
    }

    public boolean isExpired() {
        return deadline != null && deadline.isBefore(LocalDate.now());
    }

    public boolean isAcceptingApplications() {
        return status == JobStatus.PUBLISHED && !isExpired();
    }

    // Getters (no setters — enforce through methods)
    public UUID getId() { return id; }
    public UUID getCompanyId() { return companyId; }
    public String getTitle() { return title; }
    public JobStatus getStatus() { return status; }
    public Salary getSalary() { return salary; }
    public LocalDateTime getPublishedAt() { return publishedAt; }

    // Setters chỉ cho phép thay đổi nội dung khi DRAFT
    public void updateContent(String title, String description,
                               String requirements, Salary salary) {
        if (status != JobStatus.DRAFT)
            throw new DomainException("Chỉ có thể chỉnh sửa bài ở trạng thái DRAFT");
        this.title = title;
        this.description = description;
        this.requirements = requirements;
        this.salary = salary;
    }
}


// ── domain/model/application/Application.java ───────────────────
package com.jobplatform.domain.model.application;

import com.jobplatform.domain.enums.ApplicationStatus;
import com.jobplatform.domain.exception.DomainException;
import java.time.LocalDateTime;
import java.util.UUID;

public class Application {

    private UUID id;
    private UUID jobPostId;
    private UUID candidateId;
    private UUID cvId;
    private String coverLetter;
    private ApplicationStatus status;
    private Double aiMatchScore;
    private String aiMatchReason;
    private LocalDateTime appliedAt;

    public static Application create(UUID jobPostId, UUID candidateId, UUID cvId,
                                      String coverLetter) {
        Application app = new Application();
        app.id = UUID.randomUUID();
        app.jobPostId = jobPostId;
        app.candidateId = candidateId;
        app.cvId = cvId;
        app.coverLetter = coverLetter;
        app.status = ApplicationStatus.SUBMITTED;
        app.appliedAt = LocalDateTime.now();
        return app;
    }

    // ── Status Transition Rules ──────────────────────────────────
    public void moveToReviewing() {
        if (status != ApplicationStatus.SUBMITTED)
            throw new DomainException("Không thể chuyển sang Reviewing từ " + status);
        this.status = ApplicationStatus.REVIEWING;
    }

    public void scheduleInterview() {
        if (status != ApplicationStatus.REVIEWING)
            throw new DomainException("Phải ở trạng thái Reviewing để lên lịch phỏng vấn");
        this.status = ApplicationStatus.INTERVIEW;
    }

    public void makeOffer() {
        if (status != ApplicationStatus.INTERVIEW)
            throw new DomainException("Phải qua phỏng vấn mới được offer");
        this.status = ApplicationStatus.OFFER;
    }

    public void hire() {
        if (status != ApplicationStatus.OFFER)
            throw new DomainException("Chỉ có thể hire sau khi đã offer");
        this.status = ApplicationStatus.HIRED;
    }

    public void reject(String reason) {
        if (status == ApplicationStatus.HIRED || status == ApplicationStatus.WITHDRAWN)
            throw new DomainException("Không thể từ chối đơn ở trạng thái " + status);
        this.status = ApplicationStatus.REJECTED;
    }

    public void withdraw() {
        if (status == ApplicationStatus.HIRED || status == ApplicationStatus.REJECTED)
            throw new DomainException("Không thể rút đơn ở trạng thái " + status);
        this.status = ApplicationStatus.WITHDRAWN;
    }

    public void setAIScore(Double score, String reason) {
        this.aiMatchScore = score;
        this.aiMatchReason = reason;
    }

    public UUID getId() { return id; }
    public UUID getJobPostId() { return jobPostId; }
    public UUID getCandidateId() { return candidateId; }
    public UUID getCvId() { return cvId; }
    public ApplicationStatus getStatus() { return status; }
    public Double getAiMatchScore() { return aiMatchScore; }
}


// ════════════════════════════════════════════════════════════════
// LAYER 2: APPLICATION
// ════════════════════════════════════════════════════════════════

// ── application/port/in/job/CreateJobPostUseCase.java ────────────
package com.jobplatform.application.port.in.job;

import com.jobplatform.application.command.job.CreateJobPostCommand;
import com.jobplatform.domain.model.job.JobPost;

public interface CreateJobPostUseCase {
    JobPost execute(CreateJobPostCommand command);
}


// ── application/port/out/persistence/JobPostRepository.java ─────
package com.jobplatform.application.port.out.persistence;

import com.jobplatform.domain.model.job.JobPost;
import java.util.Optional;
import java.util.UUID;

// KHÔNG extends JpaRepository — pure interface
public interface JobPostRepository {
    JobPost save(JobPost jobPost);
    Optional<JobPost> findById(UUID id);
    Optional<JobPost> findByIdAndCompanyId(UUID id, UUID companyId);
}


// ── application/port/out/ai/EmbeddingPort.java ──────────────────
package com.jobplatform.application.port.out.ai;

import java.util.List;

public interface EmbeddingPort {
    float[] createEmbedding(String text);
    List<float[]> createEmbeddings(List<String> texts);
}


// ── application/command/job/CreateJobPostCommand.java ────────────
package com.jobplatform.application.command.job;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateJobPostCommand(
    UUID companyId,
    String title,
    String description,
    String requirements,
    String benefits,
    Integer industryCategoryId,
    String employmentType,
    String experienceLevel,
    BigDecimal salaryMin,
    BigDecimal salaryMax,
    boolean salaryNegotiable,
    Integer provinceId,
    String workLocationType,
    int quantity,
    LocalDate deadline,
    List<Integer> requiredSkillIds,
    List<Integer> optionalSkillIds
) {}


// ── application/usecase/job/CreateJobPostUseCaseImpl.java ────────
package com.jobplatform.application.usecase.job;

import com.jobplatform.application.command.job.CreateJobPostCommand;
import com.jobplatform.application.port.in.job.CreateJobPostUseCase;
import com.jobplatform.application.port.out.persistence.CompanySubscriptionRepository;
import com.jobplatform.application.port.out.persistence.JobPostRepository;
import com.jobplatform.application.port.out.ai.EmbeddingPort;
import com.jobplatform.domain.exception.QuotaExceededException;
import com.jobplatform.domain.model.job.JobPost;
import com.jobplatform.domain.model.subscription.CompanySubscription;
import com.jobplatform.domain.valueobject.Salary;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreateJobPostUseCaseImpl implements CreateJobPostUseCase {

    private final JobPostRepository jobPostRepository;
    private final CompanySubscriptionRepository subscriptionRepository;
    private final EmbeddingPort embeddingPort;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public JobPost execute(CreateJobPostCommand command) {

        // 1. Kiểm tra subscription & quota
        CompanySubscription subscription = subscriptionRepository
            .findActiveByCompanyId(command.companyId())
            .orElseThrow(() -> new QuotaExceededException(
                "Công ty chưa đăng ký gói dịch vụ"));

        subscription.consumeJobPostQuota(); // throws QuotaExceededException nếu hết

        // 2. Tạo domain object
        Salary salary = command.salaryNegotiable()
            ? Salary.negotiable()
            : Salary.of(command.salaryMin(), command.salaryMax());

        JobPost jobPost = JobPost.create(
            command.companyId(),
            command.title(),
            command.description(),
            salary
        );

        // 3. Lưu vào DB (qua port — không biết là JPA)
        JobPost saved = jobPostRepository.save(jobPost);

        // 4. Tạo AI embedding bất đồng bộ (không block response)
        String textToEmbed = command.title() + " " + command.description();
        eventPublisher.publishEvent(new JobPostCreatedEvent(saved.getId(), textToEmbed));

        // 5. Cập nhật quota đã dùng
        subscriptionRepository.save(subscription);

        return saved;
    }
}


// ── application/usecase/application/SubmitApplicationUseCaseImpl.java
package com.jobplatform.application.usecase.application;

import com.jobplatform.application.command.application.SubmitApplicationCommand;
import com.jobplatform.application.port.in.application.SubmitApplicationUseCase;
import com.jobplatform.application.port.out.persistence.*;
import com.jobplatform.application.port.out.ai.CVScoringPort;
import com.jobplatform.domain.exception.DomainException;
import com.jobplatform.domain.model.application.Application;
import com.jobplatform.domain.model.job.JobPost;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubmitApplicationUseCaseImpl implements SubmitApplicationUseCase {

    private final ApplicationRepository applicationRepository;
    private final JobPostRepository jobPostRepository;
    private final CandidateCVRepository cvRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public Application execute(SubmitApplicationCommand command) {

        // 1. Kiểm tra bài đăng còn nhận hồ sơ không
        JobPost jobPost = jobPostRepository.findById(command.jobPostId())
            .orElseThrow(() -> new DomainException("Tin tuyển dụng không tồn tại"));

        if (!jobPost.isAcceptingApplications())
            throw new DomainException("Tin tuyển dụng không còn nhận hồ sơ");

        // 2. Kiểm tra đã ứng tuyển chưa
        if (applicationRepository.existsByJobPostIdAndCandidateId(
                command.jobPostId(), command.candidateId()))
            throw new DomainException("Bạn đã ứng tuyển vị trí này rồi");

        // 3. Tạo application domain object
        Application application = Application.create(
            command.jobPostId(),
            command.candidateId(),
            command.cvId(),
            command.coverLetter()
        );

        // 4. Lưu
        Application saved = applicationRepository.save(application);

        // 5. Fire domain event — AI scoring chạy async
        eventPublisher.publishEvent(new ApplicationSubmittedEvent(
            saved.getId(), command.cvId(), command.jobPostId()));

        return saved;
    }
}


// ════════════════════════════════════════════════════════════════
// LAYER 3: INFRASTRUCTURE
// ════════════════════════════════════════════════════════════════

// ── infrastructure/persistence/entity/JobPostJpaEntity.java ─────
package com.jobplatform.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_posts")
@Getter @Setter
public class JobPostJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "salary_min", precision = 15, scale = 2)
    private java.math.BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 15, scale = 2)
    private java.math.BigDecimal salaryMax;

    @Column(name = "salary_negotiable")
    private boolean salaryNegotiable;

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private com.jobplatform.domain.enums.JobStatus status;

    @Column(name = "is_featured")
    private boolean featured;

    private LocalDate deadline;

    // pgvector — lưu AI embedding
    @JdbcTypeCode(SqlTypes.VECTOR)
    @Column(name = "ai_jd_vector", columnDefinition = "vector(1536)")
    private float[] aiJdVector;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}


// ── infrastructure/persistence/mapper/JobPostPersistenceMapper.java
package com.jobplatform.infrastructure.persistence.mapper;

import com.jobplatform.domain.model.job.JobPost;
import com.jobplatform.domain.valueobject.Salary;
import com.jobplatform.infrastructure.persistence.entity.JobPostJpaEntity;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class JobPostPersistenceMapper {

    public JobPost toDomain(JobPostJpaEntity entity) {
        Salary salary = entity.isSalaryNegotiable()
            ? Salary.negotiable()
            : Salary.of(entity.getSalaryMin(), entity.getSalaryMax());

        return JobPost.reconstitute(    // factory method để tái tạo từ DB
            entity.getId(),
            entity.getCompanyId(),
            entity.getTitle(),
            entity.getDescription(),
            salary,
            entity.getStatus(),
            entity.isFeatured(),
            entity.getDeadline(),
            entity.getPublishedAt(),
            entity.getCreatedAt()
        );
    }

    public JobPostJpaEntity toEntity(JobPost domain) {
        JobPostJpaEntity entity = new JobPostJpaEntity();
        entity.setId(domain.getId());
        entity.setCompanyId(domain.getCompanyId());
        entity.setTitle(domain.getTitle());
        entity.setStatus(domain.getStatus());
        entity.setSalaryNegotiable(domain.getSalary().negotiable());
        if (!domain.getSalary().negotiable()) {
            entity.setSalaryMin(domain.getSalary().min());
            entity.setSalaryMax(domain.getSalary().max());
        }
        entity.setFeatured(domain.isFeatured());
        entity.setDeadline(domain.getDeadline());
        entity.setPublishedAt(domain.getPublishedAt());
        return entity;
    }
}


// ── infrastructure/persistence/adapter/JobPostRepositoryAdapter.java
package com.jobplatform.infrastructure.persistence.adapter;

import com.jobplatform.application.port.out.persistence.JobPostRepository;
import com.jobplatform.domain.model.job.JobPost;
import com.jobplatform.infrastructure.persistence.entity.JobPostJpaEntity;
import com.jobplatform.infrastructure.persistence.jpa.JobPostJpaRepository;
import com.jobplatform.infrastructure.persistence.mapper.JobPostPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JobPostRepositoryAdapter implements JobPostRepository {

    private final JobPostJpaRepository jpaRepository;
    private final JobPostPersistenceMapper mapper;

    @Override
    public JobPost save(JobPost jobPost) {
        JobPostJpaEntity entity = mapper.toEntity(jobPost);
        JobPostJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<JobPost> findById(UUID id) {
        return jpaRepository.findById(id)
            .map(mapper::toDomain);
    }

    @Override
    public Optional<JobPost> findByIdAndCompanyId(UUID id, UUID companyId) {
        return jpaRepository.findByIdAndCompanyId(id, companyId)
            .map(mapper::toDomain);
    }
}


// ── infrastructure/ai/openai/OpenAIEmbeddingAdapter.java ─────────
package com.jobplatform.infrastructure.ai.openai;

import com.jobplatform.application.port.out.ai.EmbeddingPort;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OpenAIEmbeddingAdapter implements EmbeddingPort {

    private final EmbeddingModel embeddingModel;    // Spring AI

    @Override
    public float[] createEmbedding(String text) {
        return embeddingModel.embed(text);
    }

    @Override
    public List<float[]> createEmbeddings(List<String> texts) {
        return embeddingModel.embed(texts);
    }
}


// ════════════════════════════════════════════════════════════════
// LAYER 4: PRESENTATION
// ════════════════════════════════════════════════════════════════

// ── presentation/rest/job/dto/CreateJobPostRequest.java ──────────
package com.jobplatform.presentation.rest.job.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateJobPostRequest(
    @NotBlank(message = "Tiêu đề không được trống")
    @Size(max = 300)
    String title,

    @NotBlank(message = "Mô tả công việc không được trống")
    String description,

    String requirements,
    String benefits,

    @NotNull
    Integer industryCategoryId,

    @NotBlank
    String employmentType,

    String experienceLevel,

    @DecimalMin(value = "0", message = "Lương không được âm")
    BigDecimal salaryMin,

    BigDecimal salaryMax,

    boolean salaryNegotiable,

    Integer provinceId,

    @NotBlank
    String workLocationType,

    @Min(1) @Max(100)
    int quantity,

    @Future(message = "Hạn nộp phải là ngày trong tương lai")
    LocalDate deadline,

    List<Integer> requiredSkillIds,
    List<Integer> optionalSkillIds
) {}


// ── presentation/rest/job/JobPostController.java ─────────────────
package com.jobplatform.presentation.rest.job;

import com.jobplatform.application.port.in.job.*;
import com.jobplatform.application.command.job.CreateJobPostCommand;
import com.jobplatform.domain.model.job.JobPost;
import com.jobplatform.presentation.mapper.JobPostPresentationMapper;
import com.jobplatform.presentation.rest.job.dto.*;
import com.jobplatform.presentation.advice.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobPostController {

    private final CreateJobPostUseCase createJobPostUseCase;
    private final PublishJobPostUseCase publishJobPostUseCase;
    private final CloseJobPostUseCase closeJobPostUseCase;
    private final GetJobPostDetailUseCase getJobPostDetailUseCase;
    private final JobPostPresentationMapper mapper;

    // ── Employer: Tạo bài đăng ──────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<JobPostResponse>> createJobPost(
        @Valid @RequestBody CreateJobPostRequest request,
        @AuthenticationPrincipal UUID companyId
    ) {
        CreateJobPostCommand command = mapper.toCommand(request, companyId);
        JobPost created = createJobPostUseCase.execute(command);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(mapper.toResponse(created)));
    }

    // ── Employer: Submit để review ───────────────────────────────
    @PatchMapping("/{id}/submit")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<JobPostResponse>> submitJobPost(
        @PathVariable UUID id,
        @AuthenticationPrincipal UUID companyId
    ) {
        JobPost submitted = publishJobPostUseCase.submit(id, companyId);
        return ResponseEntity.ok(ApiResponse.success(mapper.toResponse(submitted)));
    }

    // ── Public: Xem chi tiết bài đăng ───────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobPostResponse>> getJobPost(
        @PathVariable UUID id
    ) {
        JobPost jobPost = getJobPostDetailUseCase.execute(id);
        return ResponseEntity.ok(ApiResponse.success(mapper.toResponse(jobPost)));
    }

    // ── Employer: Đóng bài đăng ──────────────────────────────────
    @PatchMapping("/{id}/close")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<Void>> closeJobPost(
        @PathVariable UUID id,
        @AuthenticationPrincipal UUID companyId
    ) {
        closeJobPostUseCase.execute(id, companyId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}


// ── presentation/advice/ApiResponse.java ─────────────────────────
package com.jobplatform.presentation.advice;

public record ApiResponse<T>(
    boolean success,
    T data,
    String message,
    Object errors
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    public static <T> ApiResponse<T> error(String message, Object errors) {
        return new ApiResponse<>(false, null, message, errors);
    }
}


// ── presentation/advice/GlobalExceptionHandler.java ─────────────
package com.jobplatform.presentation.advice;

import com.jobplatform.domain.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ApiResponse<Void>> handleDomain(DomainException e) {
        return ResponseEntity
            .status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(ApiResponse.error(e.getMessage(), null));
    }

    @ExceptionHandler(QuotaExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleQuota(QuotaExceededException e) {
        return ResponseEntity
            .status(HttpStatus.PAYMENT_REQUIRED)
            .body(ApiResponse.error(e.getMessage(), null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            MethodArgumentNotValidException e) {
        Map<String, String> errors = e.getBindingResult()
            .getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                f -> f.getDefaultMessage() != null ? f.getDefaultMessage() : "Invalid"
            ));
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("Dữ liệu không hợp lệ", errors));
    }
}


// ════════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════════

// ── test/unit/usecase/job/CreateJobPostUseCaseTest.java ──────────
package com.jobplatform.usecase.job;

import com.jobplatform.application.command.job.CreateJobPostCommand;
import com.jobplatform.application.port.out.ai.EmbeddingPort;
import com.jobplatform.application.port.out.persistence.*;
import com.jobplatform.application.usecase.job.CreateJobPostUseCaseImpl;
import com.jobplatform.domain.exception.QuotaExceededException;
import com.jobplatform.domain.model.job.JobPost;
import com.jobplatform.domain.model.subscription.CompanySubscription;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)     // KHÔNG cần @SpringBootTest — chạy siêu nhanh
class CreateJobPostUseCaseTest {

    @Mock JobPostRepository jobPostRepository;
    @Mock CompanySubscriptionRepository subscriptionRepository;
    @Mock EmbeddingPort embeddingPort;
    @Mock ApplicationEventPublisher eventPublisher;

    @InjectMocks CreateJobPostUseCaseImpl useCase;

    @Test
    void shouldCreateJobPostSuccessfully() {
        // Arrange
        UUID companyId = UUID.randomUUID();
        CompanySubscription activeSub = mockActiveSubscription(companyId);
        when(subscriptionRepository.findActiveByCompanyId(companyId))
            .thenReturn(Optional.of(activeSub));
        when(jobPostRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        CreateJobPostCommand command = mockCommand(companyId);

        // Act
        JobPost result = useCase.execute(command);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo(command.title());
        assertThat(result.getCompanyId()).isEqualTo(companyId);
        verify(jobPostRepository).save(any(JobPost.class));
        verify(eventPublisher).publishEvent(any());     // AI embedding fired
    }

    @Test
    void shouldThrowWhenNoActiveSubscription() {
        UUID companyId = UUID.randomUUID();
        when(subscriptionRepository.findActiveByCompanyId(companyId))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute(mockCommand(companyId)))
            .isInstanceOf(QuotaExceededException.class)
            .hasMessageContaining("chưa đăng ký gói");
    }

    @Test
    void shouldThrowWhenQuotaExceeded() {
        UUID companyId = UUID.randomUUID();
        CompanySubscription exhaustedSub = mockExhaustedSubscription(companyId);
        when(subscriptionRepository.findActiveByCompanyId(companyId))
            .thenReturn(Optional.of(exhaustedSub));

        assertThatThrownBy(() -> useCase.execute(mockCommand(companyId)))
            .isInstanceOf(QuotaExceededException.class);
    }

    // helpers omitted for brevity
}


// ── test/unit/domain/JobPostTest.java ────────────────────────────
package com.jobplatform.domain;

import com.jobplatform.domain.enums.JobStatus;
import com.jobplatform.domain.exception.DomainException;
import com.jobplatform.domain.model.job.JobPost;
import com.jobplatform.domain.valueobject.Salary;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

class JobPostTest {

    @Test
    void shouldStartAsDraft() {
        JobPost job = JobPost.create(UUID.randomUUID(), "Dev", "Desc", Salary.negotiable());
        assertThat(job.getStatus()).isEqualTo(JobStatus.DRAFT);
    }

    @Test
    void shouldNotPublishDirectlyFromDraft() {
        JobPost job = JobPost.create(UUID.randomUUID(), "Dev", "Desc", Salary.negotiable());
        assertThatThrownBy(job::publish)
            .isInstanceOf(DomainException.class)
            .hasMessageContaining("PENDING_REVIEW");
    }

    @Test
    void shouldFollowCorrectStatusFlow() {
        JobPost job = JobPost.create(UUID.randomUUID(), "Dev", "Desc", Salary.negotiable());
        job.submit();
        assertThat(job.getStatus()).isEqualTo(JobStatus.PENDING_REVIEW);
        job.publish();
        assertThat(job.getStatus()).isEqualTo(JobStatus.PUBLISHED);
        job.close();
        assertThat(job.getStatus()).isEqualTo(JobStatus.CLOSED);
    }

    @Test
    void shouldRejectInvalidSalaryRange() {
        assertThatThrownBy(() ->
            Salary.of(new BigDecimal("5000000"), new BigDecimal("2000000"))
        ).isInstanceOf(DomainException.class);
    }
}
