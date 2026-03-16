package edu.tlu.jobplatform.user.presentation;

import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.user.application.dto.AdminUserQuery;
import edu.tlu.jobplatform.user.application.dto.AdminUserSummary;
import edu.tlu.jobplatform.user.application.usecase.SearchUsersUseCase;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin - Users", description = "Quản lý người dùng (chỉ ADMIN)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminUserController {

    private final SearchUsersUseCase searchUsersUseCase;

    @Operation(summary = "Tìm kiếm / lọc danh sách user", description = """
            Hỗ trợ tìm kiếm đa điều kiện với phân trang.

            **Filters:**
            - `keyword` — tìm theo họ tên hoặc email (không phân biệt hoa thường)
            - `role`    — CANDIDATE | EMPLOYER | ADMIN | SUPER_ADMIN
            - `active`  — true / false

            **Sorting:** `sortBy` nhận một trong:
            `createdAt` (default) | `lastLoginAt` | `fullName` | `email` | `role`

            `sortDir`: `asc` | `desc` (default: desc)
            """)
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminUserSummary>>> searchUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        AdminUserQuery query = new AdminUserQuery();
        query.setKeyword(keyword);
        query.setRole(role);
        query.setActive(active);
        query.setPage(page);
        query.setSize(size);
        query.setSortBy(sortBy);
        query.setSortDir(sortDir);

        return ResponseEntity.ok(ApiResponse.success(searchUsersUseCase.execute(query)));
    }
}