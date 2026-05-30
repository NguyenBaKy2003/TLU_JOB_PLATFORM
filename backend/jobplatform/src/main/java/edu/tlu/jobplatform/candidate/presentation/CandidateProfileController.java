package edu.tlu.jobplatform.candidate.presentation;

import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.candidate.application.usecase.education.*;
import edu.tlu.jobplatform.candidate.application.usecase.experience.*;
import edu.tlu.jobplatform.candidate.application.usecase.profile.*;
import edu.tlu.jobplatform.candidate.domain.model.*;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile.JobSearchStatus;
import edu.tlu.jobplatform.candidate.domain.model.DesiredJob.ContractType;
import edu.tlu.jobplatform.candidate.domain.model.DesiredJob.Level;
import edu.tlu.jobplatform.candidate.domain.model.SocialLink.Platform;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.candidate.presentation.dto.request.EducationRequest;
import edu.tlu.jobplatform.candidate.presentation.dto.request.ExperienceRequest;
import edu.tlu.jobplatform.candidate.presentation.dto.request.UpdateProfileRequest;
import edu.tlu.jobplatform.candidate.presentation.dto.request.UpdateProfileUrlRequest;
import edu.tlu.jobplatform.candidate.presentation.dto.response.CandidateProfileResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidate/profile")
@RequiredArgsConstructor
@Tag(name = "Candidate - Profile", description = "Quản lý hồ sơ ứng viên")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateProfileController {

        private final GetProfileUseCase getProfileUseCase;
        private final UpdateProfileUseCase updateProfileUseCase;
        private final UpdateJobSearchStatusUseCase updateJobSearchStatusUseCase;
        private final UpdateAvatarUseCase updateAvatarUseCase;
        private final AddExperienceUseCase addExperienceUseCase;
        private final UpdateExperienceUseCase updateExperienceUseCase;
        private final DeleteExperienceUseCase deleteExperienceUseCase;
        private final AddEducationUseCase addEducationUseCase;
        private final UpdateEducationUseCase updateEducationUseCase;
        private final DeleteEducationUseCase deleteEducationUseCase;
        private final UpdateProfileUrlUseCase updateProfileUrlUseCase;
        private final BoostCvUseCase boostCvUseCase;
        private final CandidateProfileRepository profileRepository;
        // ── GET /me ─

        @Operation(summary = "Lấy hồ sơ của tôi")
        @GetMapping("/me")
        @RateLimit(policy = "candidate-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<CandidateProfileResponse>> getMyProfile(
                        @CurrentUser UUID userId) {

                CandidateProfile profile = getProfileUseCase.execute(userId);
                return ResponseEntity.ok(ApiResponse.success(
                                CandidateProfileResponse.from(profile)));
        }

        // ── PUT /me ─

        @Operation(summary = "Cập nhật hồ sơ (PATCH semantics — chỉ gửi field cần đổi; gửi null để xóa)")
        @PutMapping("/me")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_UPDATE_PROFILE", resourceType = "CandidateProfile")
        public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateProfile(
                        @CurrentUser UUID userId,
                        @Valid @RequestBody UpdateProfileRequest req) {

                UpdateProfileUseCase.Command cmd = new UpdateProfileUseCase.Command(
                                userId,
                                req.getFirstName(),
                                req.getLastName(),
                                req.getHeadline(),
                                req.getSummary(),
                                req.getPhone(),
                                req.getLocation(),
                                req.getPostalCode(),
                                req.getDateOfBirth(),
                                req.getGender(),
                                req.getMaritalStatus(),
                                req.getExpectedSalary(),
                                req.getCurrency(),
                                mapSkills(req),
                                mapLanguages(req),
                                mapSocialLinks(req),
                                mapDesiredJob(req),
                                mapBenefits(req));

                CandidateProfile updated = updateProfileUseCase.execute(cmd);
                return ResponseEntity.ok(ApiResponse.success(
                                CandidateProfileResponse.from(updated),
                                "Hồ sơ đã được cập nhật."));
        }

        @Operation(summary = "Boost CV lên top tìm kiếm ⭐ PRO/PREMIUM", description = """
                        Đẩy hồ sơ của bạn lên ưu tiên trong kết quả tìm kiếm của nhà tuyển dụng.
                        Hiệu lực trong **7 ngày** kể từ lúc boost.
                        Boost lại khi đang có hiệu lực sẽ **gia hạn thêm 7 ngày từ thời điểm hiện tại**.

                        **Quota:**
                        - Gói PRO     : 3 lần/tháng (reset đầu tháng)
                        - Gói PREMIUM : không giới hạn

                        **Error codes:**
                        - `NO_ACTIVE_CANDIDATE_SUBSCRIPTION` : chưa mua gói
                        - `CV_BOOST_QUOTA_EXCEEDED`           : hết lượt boost tháng này
                        """)
        @PostMapping("/boost")
        @RateLimit(policy = "cv-boost", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<BoostCvUseCase.Result>> boostCv(
                        @CurrentUser UUID candidateId) {

                BoostCvUseCase.Result result = boostCvUseCase.execute(candidateId);

                String message = "CV của bạn đã được boost! Hiệu lực đến "
                                + result.boostedUntil().toLocalDate()
                                + (result.boostsRemaining() >= 0
                                                ? ". Còn " + result.boostsRemaining() + " lượt boost trong tháng."
                                                : ". (Không giới hạn lượt)");

                return ResponseEntity.ok(ApiResponse.success(result, message));
        }

        @Operation(summary = "Trạng thái boost CV hiện tại", description = """
                        Kiểm tra profile của bạn có đang được boost hay không,
                        và thời điểm boost hết hiệu lực.
                        """)
        @GetMapping("/boost/status")
        @RateLimit(policy = "candidate-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<BoostStatusResponse>> getBoostStatus(
                        @CurrentUser UUID candidateId) {

                CandidateProfile profile = profileRepository.findByUserId(candidateId)
                                .orElseThrow(() -> ResourceNotFoundException.of("CandidateProfile", candidateId));

                return ResponseEntity.ok(ApiResponse.success(new BoostStatusResponse(
                                profile.isBoosted(),
                                profile.getBoostedUntil())));
        }

        // ── PATCH /me/avatar

        @Operation(summary = "Cập nhật avatar")
        @PatchMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @RateLimit(policy = "cv-upload", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_UPDATE_AVATAR", resourceType = "CandidateProfile")
        public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateAvatar(
                        @CurrentUser UUID userId,
                        @RequestPart("file") MultipartFile file) {

                CandidateProfile updated = updateAvatarUseCase.execute(userId, file);
                return ResponseEntity.ok(ApiResponse.success(
                                CandidateProfileResponse.from(updated), "Ảnh đại diện đã được cập nhật."));
        }

        // ── PATCH /me/profile-url ─

        @Operation(summary = "Cập nhật URL hồ sơ cá nhân")
        @PatchMapping("/me/profile-url")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_UPDATE_PROFILE_URL", resourceType = "CandidateProfile")
        public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateProfileUrl(
                        @CurrentUser UUID userId,
                        @RequestBody @Valid UpdateProfileUrlRequest req) {

                CandidateProfile updated = updateProfileUrlUseCase.execute(userId, req.getSlug());
                return ResponseEntity.ok(ApiResponse.success(
                                CandidateProfileResponse.from(updated),
                                "URL hồ sơ đã được cập nhật."));
        }

        // ── PATCH /me/job-search-status ─

        @Operation(summary = "Cập nhật trạng thái tìm việc")
        @PatchMapping("/me/job-search-status")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<Void>> updateJobSearchStatus(
                        @CurrentUser UUID userId,
                        @RequestParam JobSearchStatus status) {

                updateJobSearchStatusUseCase.execute(userId, status);
                return ResponseEntity.ok(ApiResponse.success(
                                "Trạng thái tìm việc đã được cập nhật."));
        }

        // ── Work experiences

        @Operation(summary = "Thêm kinh nghiệm làm việc")
        @PostMapping("/me/experiences")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_ADD_EXPERIENCE", resourceType = "CandidateProfile")
        public ResponseEntity<ApiResponse<CandidateProfileResponse>> addExperience(
                        @CurrentUser UUID userId,
                        @Valid @RequestBody ExperienceRequest req) {

                CandidateProfile updated = addExperienceUseCase.execute(
                                userId, buildExperience(null, req));
                return ResponseEntity.ok(ApiResponse.success(
                                CandidateProfileResponse.from(updated), "Đã thêm kinh nghiệm làm việc."));
        }

        @Operation(summary = "Cập nhật kinh nghiệm làm việc")
        @PutMapping("/me/experiences/{experienceId}")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_UPDATE_EXPERIENCE", resourceType = "CandidateProfile")
        public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateExperience(
                        @CurrentUser UUID userId,
                        @PathVariable UUID experienceId,
                        @Valid @RequestBody ExperienceRequest req) {

                CandidateProfile updated = updateExperienceUseCase.execute(
                                userId, experienceId, buildExperience(experienceId, req));
                return ResponseEntity.ok(ApiResponse.success(
                                CandidateProfileResponse.from(updated), "Đã cập nhật kinh nghiệm làm việc."));
        }

        @Operation(summary = "Xóa kinh nghiệm làm việc")
        @DeleteMapping("/me/experiences/{experienceId}")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_DELETE_EXPERIENCE", resourceType = "CandidateProfile")
        public ResponseEntity<ApiResponse<Void>> deleteExperience(
                        @CurrentUser UUID userId,
                        @PathVariable UUID experienceId) {

                deleteExperienceUseCase.execute(userId, experienceId);
                return ResponseEntity.ok(ApiResponse.success("Đã xóa kinh nghiệm làm việc."));
        }

        // ── Educations ─

        @Operation(summary = "Thêm học vấn")
        @PostMapping("/me/educations")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_ADD_EDUCATION", resourceType = "CandidateProfile")
        public ResponseEntity<ApiResponse<CandidateProfileResponse>> addEducation(
                        @CurrentUser UUID userId,
                        @Valid @RequestBody EducationRequest req) {

                CandidateProfile updated = addEducationUseCase.execute(
                                userId, buildEducation(null, req));
                return ResponseEntity.ok(ApiResponse.success(
                                CandidateProfileResponse.from(updated), "Đã thêm học vấn."));
        }

        @Operation(summary = "Cập nhật học vấn")
        @PutMapping("/me/educations/{educationId}")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_UPDATE_EDUCATION", resourceType = "CandidateProfile")
        public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateEducation(
                        @CurrentUser UUID userId,
                        @PathVariable UUID educationId,
                        @Valid @RequestBody EducationRequest req) {

                CandidateProfile updated = updateEducationUseCase.execute(
                                userId, educationId, buildEducation(educationId, req));
                return ResponseEntity.ok(ApiResponse.success(
                                CandidateProfileResponse.from(updated), "Đã cập nhật học vấn."));
        }

        @Operation(summary = "Xóa học vấn")
        @DeleteMapping("/me/educations/{educationId}")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_DELETE_EDUCATION", resourceType = "CandidateProfile")
        public ResponseEntity<ApiResponse<Void>> deleteEducation(
                        @CurrentUser UUID userId,
                        @PathVariable UUID educationId) {

                deleteEducationUseCase.execute(userId, educationId);
                return ResponseEntity.ok(ApiResponse.success("Đã xóa học vấn."));
        }

        // ── Private mappers ─

        private List<Skill> mapSkills(UpdateProfileRequest req) {
                if (req.getSkills() == null)
                        return null;
                return req.getSkills().stream()
                                .map(s -> Skill.of(s.getName(), s.getLevel(), s.getYearsOfExp()))
                                .toList();
        }

        private List<Language> mapLanguages(UpdateProfileRequest req) {
                if (req.getLanguages() == null)
                        return null;
                return req.getLanguages().stream()
                                .map(l -> Language.of(
                                                l.getName(),
                                                Language.Level.valueOf(l.getLevel().toUpperCase())))
                                .toList();
        }

        private List<SocialLink> mapSocialLinks(UpdateProfileRequest req) {
                if (req.getSocialLinks() == null)
                        return null;
                return req.getSocialLinks().stream()
                                .map(l -> SocialLink.of(
                                                Platform.valueOf(l.getPlatform().toUpperCase()),
                                                l.getUrl()))
                                .toList();
        }

        private DesiredJob mapDesiredJob(UpdateProfileRequest req) {
                if (req.getDesiredJob() == null)
                        return null;
                UpdateProfileRequest.DesiredJobRequest d = req.getDesiredJob();
                return DesiredJob.of(
                                d.getIndustry(), d.getMinSalary(), d.getCurrency(),
                                d.getContractTypes() == null ? List.of()
                                                : d.getContractTypes().stream()
                                                                .map(c -> ContractType.valueOf(c.toUpperCase()))
                                                                .toList(),
                                d.getLevels() == null ? List.of()
                                                : d.getLevels().stream()
                                                                .map(l -> Level.valueOf(l.toUpperCase()))
                                                                .toList());
        }

        private List<Benefit> mapBenefits(UpdateProfileRequest req) {
                if (req.getBenefits() == null)
                        return null;
                return req.getBenefits().stream()
                                .map(Benefit::of)
                                .toList();
        }

        private WorkExperience buildExperience(UUID id, ExperienceRequest req) {
                return WorkExperience.builder()
                                .id(id != null ? id : UUID.randomUUID())
                                .companyName(req.getCompanyName())
                                .position(req.getPosition())
                                .description(req.getDescription())
                                .startDate(req.getStartDate())
                                .endDate(req.isCurrent() ? null : req.getEndDate())
                                .current(req.isCurrent())
                                .build();
        }

        private Education buildEducation(UUID id, EducationRequest req) {
                return Education.builder()
                                .id(id != null ? id : UUID.randomUUID())
                                .school(req.getSchool())
                                .major(req.getMajor())
                                .degree(req.getDegree())
                                .startDate(req.getStartDate())
                                .endDate(req.getEndDate())
                                .description(req.getDescription())
                                .build();
        }

        public record BoostStatusResponse(
                        boolean currentlyBoosted,
                        LocalDateTime boostedUntil) {
        }
}