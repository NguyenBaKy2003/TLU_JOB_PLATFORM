package edu.tlu.jobplatform.company.presentation.dto;

import edu.tlu.jobplatform.company.domain.model.CompanySize;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Schema(description = "Thông tin tạo hồ sơ công ty")
public class CreateCompanyRequest {

    @NotBlank(message = "Tên công ty không được để trống")
    @Size(min = 2, max = 200, message = "Tên công ty từ 2 đến 200 ký tự")
    @Schema(example = "Công ty TNHH TechViet")
    private String name;

    @Size(max = 5000, message = "Mô tả tối đa 5000 ký tự")
    @Schema(example = "Chúng tôi là công ty công nghệ hàng đầu...")
    private String description;

    @Size(max = 500)
    @Schema(example = "https://techviet.vn")
    private String website;

    @Email(message = "Email không đúng định dạng")
    @Schema(example = "hr@techviet.vn")
    private String email;

    @Schema(example = "0912345678")
    private String phone;

    @Schema(example = "123 Nguyễn Huệ, Quận 1")
    private String address;

    @Schema(example = "Hồ Chí Minh")
    private String city;

    @Schema(example = "Việt Nam")
    private String country;

    @Schema(example = "Công nghệ thông tin")
    private String industry;

    @Schema(example = "MEDIUM")
    private CompanySize size;

    @Min(value = 1900, message = "Năm thành lập không hợp lệ")
    @Max(value = 2100, message = "Năm thành lập không hợp lệ")
    @Schema(example = "2015")
    private Integer foundedYear;
}