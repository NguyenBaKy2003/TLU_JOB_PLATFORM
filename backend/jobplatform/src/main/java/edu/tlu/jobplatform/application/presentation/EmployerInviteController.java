package edu.tlu.jobplatform.application.presentation;

import edu.tlu.jobplatform.application.presentation.dto.request.InviteCandidateRequest;
import edu.tlu.jobplatform.application.presentation.dto.response.InviteCandidateResponse;
import edu.tlu.jobplatform.application.usecase.employer.InviteCandidateUseCase;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Candidate Invite (Employer)", description = "Employer mời ứng viên từ AI search apply vào JD")
public class EmployerInviteController {

        private final InviteCandidateUseCase inviteUseCase;

        @Operation(summary = "Mời ứng viên ứng tuyển — gửi notification + email")
        @PostMapping("/api/v1/jobs/{jobPostId}/invite-candidate")
        @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN', 'SUPER_ADMIN')")
        public ResponseEntity<ApiResponse<InviteCandidateResponse>> invite(
                        @PathVariable UUID jobPostId,
                        @Valid @RequestBody InviteCandidateRequest req) {

                InviteCandidateResponse result = inviteUseCase.execute(
                                jobPostId,
                                new InviteCandidateUseCase.Command(
                                                req.getCandidateProfileId(),
                                                req.getPersonalMessage()));

                String message = result.isEmailDispatched()
                                ? "Đã gửi lời mời đến " + result.getCandidateName() + " qua email và thông báo."
                                : "Đã gửi thông báo đến " + result.getCandidateName() + " (không có email để gửi).";

                return ResponseEntity.ok(ApiResponse.success(result, message));
        }
}