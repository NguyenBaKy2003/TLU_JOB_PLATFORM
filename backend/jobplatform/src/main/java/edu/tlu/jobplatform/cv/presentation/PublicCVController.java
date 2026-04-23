package edu.tlu.jobplatform.cv.presentation;

import edu.tlu.jobplatform.cv.application.usecase.GetPublicCVUseCase;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.presentation.dto.response.PublicCVResponse;
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
@Tag(name = "Public CV", description = "Xem CV công khai — không cần đăng nhập")
public class PublicCVController {

    private final GetPublicCVUseCase getPublicCVUseCase;

    // ── GET /public/cv/{slug} ─────────────────────────────────────────────────

    @Operation(summary = "Xem CV public theo slug", description = """
            Truy cập CV công khai qua slug duy nhất.
            - CV phải ở trạng thái **PUBLISHED**
            - Visibility phải là **PUBLIC** hoặc **LINK_ONLY**
            - viewCount tăng tự động (async, không block response)
            - Chỉ trả về các sections có `visible = true`
            """)
    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<PublicCVResponse>> getPublicCV(
            @PathVariable String slug,
            HttpServletRequest request) {

        String viewerIp = extractClientIp(request);
        OnlineCV cv = getPublicCVUseCase.execute(slug, viewerIp);
        return ResponseEntity.ok(ApiResponse.success(PublicCVResponse.from(cv)));
    }

    // ── Helpers

    /**
     * Lấy IP thực của client, xử lý trường hợp đứng sau proxy / load balancer.
     */
    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            // X-Forwarded-For có thể chứa nhiều IP cách nhau bởi dấu phẩy;
            // IP đầu tiên là IP gốc của client.
            return forwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}