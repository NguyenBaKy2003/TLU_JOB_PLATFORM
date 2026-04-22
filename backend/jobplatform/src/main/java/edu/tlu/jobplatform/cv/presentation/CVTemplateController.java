package edu.tlu.jobplatform.cv.presentation;

import edu.tlu.jobplatform.cv.application.usecase.GetCVTemplatesUseCase;
import edu.tlu.jobplatform.cv.presentation.dto.response.CVTemplateResponse;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Không yêu cầu auth — ai cũng có thể xem danh sách template để chọn trước khi
 * đăng ký.
 */
@RestController
@RequestMapping("/api/v1/cv/templates")
@RequiredArgsConstructor
@Tag(name = "CV Templates", description = "Danh sách template CV")
public class CVTemplateController {

    private final GetCVTemplatesUseCase getTemplatesUseCase;

    @Operation(summary = "Danh sách template CV", description = """
            Trả về toàn bộ template hiện có (cả free và premium).
            Field `premium = true` → yêu cầu subscription để sử dụng.
            """)
    @GetMapping
    public ResponseEntity<ApiResponse<List<CVTemplateResponse>>> getTemplates() {
        List<CVTemplateResponse> templates = getTemplatesUseCase.execute()
                .stream().map(CVTemplateResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.success(templates));
    }
}