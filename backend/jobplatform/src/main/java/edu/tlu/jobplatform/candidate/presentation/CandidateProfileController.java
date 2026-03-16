package edu.tlu.jobplatform.candidate.presentation;

import edu.tlu.jobplatform.candidate.application.usecase.profile.*;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile.JobSearchStatus;
import edu.tlu.jobplatform.candidate.domain.model.Skill;
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
                req.getHeadline(),
                req.getSummary(),
                req.getPhone(),
                req.getLocation(),
                req.getDateOfBirth(),
                req.getGender(),
                req.getExpectedSalary(),
                req.getCurrency(),
                req.getSkills() == null ? null
                        : req.getSkills().stream()
                                .map(s -> Skill.of(s.getName(), s.getLevel(), s.getYearsOfExp()))
                                .toList());

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
        return ResponseEntity.ok(ApiResponse.success("Trạng thái tìm việc đã được cập nhật."));
    }
}