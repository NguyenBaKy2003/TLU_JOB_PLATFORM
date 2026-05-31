package edu.tlu.jobplatform.cv.presentation;

import edu.tlu.jobplatform.cv.application.service.CVRenderService;
import edu.tlu.jobplatform.cv.application.usecase.GetPublicCVUseCase;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.presentation.dto.response.PublicCVResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/cv")
@RequiredArgsConstructor
@Tag(name = "Public CV")
public class PublicCVController {

    private final GetPublicCVUseCase getPublicCVUseCase;
    private final CVRenderService cvRenderService; // ← inject

    @Operation(summary = "Xem CV public JSON theo slug")
    @GetMapping("/{slug}")
    @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
    public ResponseEntity<ApiResponse<PublicCVResponse>> getPublicCV(
            @PathVariable String slug,
            HttpServletRequest request) {

        OnlineCV cv = getPublicCVUseCase.execute(slug, extractClientIp(request));
        return ResponseEntity.ok(ApiResponse.success(PublicCVResponse.from(cv)));
    }

    @Operation(summary = "Xem HTML CV public theo slug")
    @GetMapping("/{slug}/html")
    @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
    public ResponseEntity<ApiResponse<String>> getPublicCVHtml(
            @PathVariable String slug,
            HttpServletRequest request) {

        OnlineCV cv = getPublicCVUseCase.execute(slug, extractClientIp(request));
        String html = cvRenderService.render(cv); // ← dùng service
        return ResponseEntity.ok(ApiResponse.success(html, "Thành công"));
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank())
            return forwardedFor.split(",")[0].trim();
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank())
            return realIp.trim();
        return request.getRemoteAddr();
    }
}