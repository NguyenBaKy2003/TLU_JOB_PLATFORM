package edu.tlu.jobplatform.user.presentation.dto;

import edu.tlu.jobplatform.shared.validation.PhoneNumberValidator;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request body cho PATCH /api/users/me và PATCH /api/users/{id}
 *
 * PATCH semantics: tất cả field đều optional.
 * null = không thay đổi field đó.
 * "" (blank) = xóa giá trị (phone, avatarUrl).
 *
 * Không cho phép thay đổi: email, role, password (các field nhạy cảm có
 * endpoint riêng).
 */
@Data
@Schema(description = "Thông tin cần cập nhật. Chỉ truyền field muốn thay đổi.")
public class UpdateUserRequest {

    @Schema(description = "Họ và tên mới", example = "Nguyễn Văn Bình", minLength = 2, maxLength = 100)
    @Size(min = 2, max = 100, message = "Họ tên từ 2 đến 100 ký tự")
    private String fullName;

    @Schema(description = "Số điện thoại (để trống để xóa)", example = "0912345678")
    @PhoneNumberValidator
    private String phone;

    @Schema(description = "URL ảnh đại diện (để trống để xóa)", example = "https://cdn.jobplatform.vn/avatars/abc.jpg")
    @Size(max = 500, message = "URL avatar tối đa 500 ký tự")
    private String avatarUrl;
}