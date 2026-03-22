package edu.tlu.jobplatform.candidate.presentation;

import edu.tlu.jobplatform.candidate.application.usecase.profile.*;
import edu.tlu.jobplatform.candidate.application.usecase.experience.*;
import edu.tlu.jobplatform.candidate.application.usecase.education.*;
import edu.tlu.jobplatform.candidate.domain.model.*;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile.JobSearchStatus;
import edu.tlu.jobplatform.candidate.domain.model.DesiredJob.ContractType;
import edu.tlu.jobplatform.candidate.domain.model.DesiredJob.Level;
import edu.tlu.jobplatform.candidate.domain.model.SocialLink.Platform;
import edu.tlu.jobplatform.candidate.presentation.dto.request.EducationRequest;
import edu.tlu.jobplatform.candidate.presentation.dto.request.ExperienceRequest;
import edu.tlu.jobplatform.candidate.presentation.dto.request.UpdateProfileRequest;
import edu.tlu.jobplatform.candidate.presentation.dto.request.UpdateProfileUrlRequest;
import edu.tlu.jobplatform.candidate.presentation.dto.response.CandidateProfileResponse;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
        private final GetAvatarUseCase getAvatarUseCase;
        private final AddExperienceUseCase addExperienceUseCase;
        private final UpdateExperienceUseCase updateExperienceUseCase;
        private final DeleteExperienceUseCase deleteExperienceUseCase;
        private final AddEducationUseCase addEducationUseCase;
        private final UpdateEducationUseCase updateEducationUseCase;
        private final DeleteEducationUseCase deleteEducationUseCase;
        private final UpdateProfileUrlUseCase updateProfileUrlUseCase;
        // ── GET /me ───────────────────────────────────────────────────

        @Operation(summary = "Lấy hồ sơ của tôi")
        @GetMapping("/me")
        public ResponseEntity<ApiResponse<CandidateProfileResponse>> getMyProfile(
                        @CurrentUser UUID userId) {

                CandidateProfile profile = getProfileUseCase.execute(userId);
                return ResponseEntity.ok(ApiResponse.success(
                                CandidateProfileResponse.from(profile)));
        }

        // ── PUT /me ───────────────────────────────────────────────────

        @Operation(summary = "Cập nhật hồ sơ (PATCH semantics — chỉ gửi field cần đổi)")
        @PutMapping("/me")
        public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateProfile(
                        @CurrentUser UUID userId,
                        @Valid @RequestBody UpdateProfileRequest req) {

                // Map request → Command
                // null field trong request → null trong Command → UseCase giữ nguyên DB
                UpdateProfileUseCase.Command cmd = new UpdateProfileUseCase.Command(
                                userId,
                                req.getFirstName(),
                                req.getLastName(),
                                req.getHeadline(),
                                req.getSummary(),
                                req.getPhone(),
                                req.getLocation(),
                                req.getDateOfBirth(),
                                req.getGender(),
                                req.getMaritalStatus(),
                                req.getExpectedSalary(), // Integer nullable
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

        // ── PATCH /me/avatar — upload ─────────────────────────────────

        @Operation(summary = "Cập nhật avatar")
        @PatchMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateAvatar(
                        @CurrentUser UUID userId,
                        @RequestPart("file") MultipartFile file) {

                CandidateProfile updated = updateAvatarUseCase.execute(userId, file);
                return ResponseEntity.ok(ApiResponse.success(
                                CandidateProfileResponse.from(updated), "Ảnh đại diện đã được cập nhật."));
        }

        // ── GET /me/avatar — stream ảnh về client ─────────────────────
        // Giống pattern /cv/{cvId}/view: stream file từ S3 qua backend
        // để đính kèm Authorization header (S3 bucket là private).

        @Operation(summary = "Xem ảnh đại diện", description = """
                        Trả về ảnh dưới dạng stream với Content-Disposition: inline.
                        Dùng endpoint này làm src cho <img> thay vì dùng S3 key trực tiếp.
                        """)
        @GetMapping("/me/avatar")
        public ResponseEntity<InputStreamResource> getAvatar(
                        @CurrentUser UUID userId) {

                GetAvatarUseCase.Result result = getAvatarUseCase.execute(userId);

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "inline; filename=\"" + result.fileName() + "\"")
                                // Cache 5 phút ở browser — ảnh đại diện ít thay đổi
                                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=300")
                                .contentType(MediaType.parseMediaType(result.contentType()))
                                .body(new InputStreamResource(result.inputStream()));
        }

        /**
         * PATCH /me/profile-url
         * Body: { "slug": "minh-hang" }
         * Response: profile với profileUrl mới
         */
        @Operation(summary = "Cập nhật URL hồ sơ cá nhân")
        @PatchMapping("/me/profile-url")
        public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateProfileUrl(
                        @CurrentUser UUID userId,
                        @RequestBody @Valid UpdateProfileUrlRequest req) {

                CandidateProfile updated = updateProfileUrlUseCase.execute(userId, req.getSlug());
                return ResponseEntity.ok(ApiResponse.success(
                                CandidateProfileResponse.from(updated),
                                "URL hồ sơ đã được cập nhật."));
        }
        // ── PATCH /me/job-search-status ───────────────────────────────

        @Operation(summary = "Cập nhật trạng thái tìm việc")
        @PatchMapping("/me/job-search-status")
        public ResponseEntity<ApiResponse<Void>> updateJobSearchStatus(
                        @CurrentUser UUID userId,
                        @RequestParam JobSearchStatus status) {

                updateJobSearchStatusUseCase.execute(userId, status);
                return ResponseEntity.ok(ApiResponse.success(
                                "Trạng thái tìm việc đã được cập nhật."));
        }

        // ── Work experiences ──────────────────────────────────────────

        @Operation(summary = "Thêm kinh nghiệm làm việc")
        @PostMapping("/me/experiences")
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
        public ResponseEntity<ApiResponse<Void>> deleteExperience(
                        @CurrentUser UUID userId,
                        @PathVariable UUID experienceId) {

                deleteExperienceUseCase.execute(userId, experienceId);
                return ResponseEntity.ok(ApiResponse.success("Đã xóa kinh nghiệm làm việc."));
        }

        // ── Educations ────────────────────────────────────────────────

        @Operation(summary = "Thêm học vấn")
        @PostMapping("/me/educations")
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
        public ResponseEntity<ApiResponse<Void>> deleteEducation(
                        @CurrentUser UUID userId,
                        @PathVariable UUID educationId) {

                deleteEducationUseCase.execute(userId, educationId);
                return ResponseEntity.ok(ApiResponse.success("Đã xóa học vấn."));
        }

        // ── Private mappers ───────────────────────────────────────────

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
}