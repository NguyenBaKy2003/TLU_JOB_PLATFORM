package edu.tlu.jobplatform.ai.presentation;

import edu.tlu.jobplatform.ai.application.usecase.AutoSuggestCandidatesUseCase;
import edu.tlu.jobplatform.ai.application.usecase.SmartSearchCandidatesUseCase;
import edu.tlu.jobplatform.ai.domain.model.CandidateSearchResult;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Candidate Search")
public class CandidateSearchController {

        private final SmartSearchCandidatesUseCase smartSearchUseCase;
        private final AutoSuggestCandidatesUseCase autoSuggestUseCase;

        @Operation(summary = "Smart search ứng viên bằng ngôn ngữ tự nhiên")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/candidates/search")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN','SUPER_ADMIN')")
        public ResponseEntity<ApiResponse<CandidateSearchResult>> smartSearch(
                        @Valid @RequestBody SmartSearchRequest req) {

                UUID employerId = SecurityUtils.getCurrentUserIdOrThrow();
                CandidateSearchResult result = smartSearchUseCase.execute(
                                new SmartSearchCandidatesUseCase.Command(
                                                employerId,
                                                req.query(),
                                                req.jobTitle(),
                                                req.requirements(),
                                                req.level(),
                                                req.location(),
                                                req.requiredSkills(),
                                                req.maxResults()));

                return ResponseEntity.ok(ApiResponse.success(result));
        }

        @Operation(summary = "Tự động gợi ý ứng viên phù hợp cho JD")
        @SecurityRequirement(name = "bearerAuth")
        @GetMapping("/jobs/{jobPostId}/candidate-suggestions")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN','SUPER_ADMIN')")
        public ResponseEntity<ApiResponse<CandidateSearchResult>> autoSuggest(
                        @PathVariable UUID jobPostId) {

                return ResponseEntity.ok(ApiResponse.success(
                                autoSuggestUseCase.execute(jobPostId)));
        }

        /**
         * Request body cho smart search.
         *
         * @param query          câu tìm kiếm tự nhiên, VD: "Java senior 3 năm, biết
         *                       K8s, HCM"
         * @param jobTitle       tên vị trí (optional)
         * @param requirements   mô tả yêu cầu dạng text (optional)
         * @param level          cấp độ: JUNIOR / MID / SENIOR / LEAD (optional)
         * @param location       thành phố (optional)
         * @param requiredSkills danh sách skill cấu trúc, VD: ["Java","Spring
         *                       Boot","K8s"]
         *                       — nếu truyền, matchedSkills/missingSkills sẽ chính xác
         *                       100%;
         *                       nếu bỏ trống, AI sẽ tự suy ra từ requirements
         * @param maxResults     số kết quả tối đa, 1–20
         */
        public record SmartSearchRequest(
                        String query,
                        String jobTitle,
                        String requirements,
                        String level,
                        String location,
                        List<String> requiredSkills,
                        @Min(1) @Max(20) int maxResults) {
        }
}