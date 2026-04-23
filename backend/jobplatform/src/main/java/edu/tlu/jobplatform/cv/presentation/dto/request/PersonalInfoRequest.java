package edu.tlu.jobplatform.cv.presentation.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PersonalInfoRequest {

    @Size(max = 150, message = "Họ tên tối đa 150 ký tự.")
    private String fullName;

    @Email(message = "Email không đúng định dạng.")
    @Size(max = 255)
    private String email;

    @Size(max = 30)
    private String phone;

    @Size(max = 300)
    private String address;

    @Size(max = 500)
    private String avatarUrl;

    @Size(max = 300, message = "Tiêu đề tối đa 300 ký tự.")
    private String headline;

    @Size(max = 300)
    private String linkedIn;

    @Size(max = 300)
    private String github;

    @Size(max = 300)
    private String website;
}