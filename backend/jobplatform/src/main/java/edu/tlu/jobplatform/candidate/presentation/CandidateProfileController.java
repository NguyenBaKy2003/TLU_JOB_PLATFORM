package edu.tlu.jobplatform.candidate.presentation;

import edu.tlu.jobplatform.candidate.application.usecase.profile.*;
import edu.tlu.jobplatform.candidate.domain.model.*;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile.JobSearchStatus;
import edu.tlu.jobplatform.candidate.domain.model.DesiredJob.ContractType;
import edu.tlu.jobplatform.candidate.domain.model.DesiredJob.Level;
import edu.tlu.jobplatform.candidate.domain.model.SocialLink.Platform;
import edu.tlu.jobplatform.candidate.presentation.dto.request.UpdateProfileRequest;
import edu.tlu.jobplatform.candidate.presentation.dto.response.CandidateProfileResponse;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

        @Operation(summary = "Lấy hồ sơ của tôi")
        @GetMapping("/me")
        public ResponseEntity<ApiResponse<CandidateProfileResponse>> getMyProfile(
                        @CurrentUser UUID userId) {

                CandidateProfile profile = getProfileUseCase.execute(userId);
                return ResponseEntity.ok(ApiResponse.success(
                                CandidateProfileResponse.from(profile)));
        }

        @Operation(summary = "Cập nhật hồ sơ")
        @PutMapping("/me")
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

        @Operation(summary = "Cập nhật trạng thái tìm việc")
        @PatchMapping("/me/job-search-status")
        public ResponseEntity<ApiResponse<Void>> updateJobSearchStatus(
                        @CurrentUser UUID userId,
                        @RequestParam JobSearchStatus status) {

                updateJobSearchStatusUseCase.execute(userId, status);
                return ResponseEntity.ok(ApiResponse.success(
                                "Trạng thái tìm việc đã được cập nhật."));
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
                                d.getIndustry(),
                                d.getMinSalary(),
                                d.getCurrency(),
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
}