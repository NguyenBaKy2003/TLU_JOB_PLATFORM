package edu.tlu.jobplatform.company.presentation.dto;

import edu.tlu.jobplatform.company.domain.model.CompanySize;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

/** PATCH semantics — tất cả field nullable */
@Data
@Schema(description = "Cập nhật hồ sơ công ty (chỉ truyền field muốn thay đổi)")
public class UpdateCompanyRequest {

    @Size(min = 2, max = 200)
    private String name;

    @Size(max = 5000)
    private String description;

    @Size(max = 500)
    private String website;

    @Email
    private String email;

    private String phone;
    private String address;
    private String city;
    private String country;
    private String industry;
    private CompanySize size;

    @Min(1900)
    @Max(2100)
    private Integer foundedYear;

    @Size(max = 500)
    private String logoUrl;

    @Size(max = 500)
    private String coverImageUrl;
}