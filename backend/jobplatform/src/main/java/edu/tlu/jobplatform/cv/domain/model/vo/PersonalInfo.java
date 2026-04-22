package edu.tlu.jobplatform.cv.domain.model.vo;

import lombok.Builder;
import lombok.Getter;

/**
 * Value Object — thông tin cá nhân hiển thị trên CV.
 * Immutable: mọi thay đổi tạo ra instance mới.
 */
@Getter
@Builder
public class PersonalInfo {

    private final String fullName;
    private final String email;
    private final String phone;
    private final String address;
    private final String avatarUrl;
    private final String headline; // "Senior Java Developer | 5 years exp"
    private final String linkedIn;
    private final String github;
    private final String website;

    /** Kiểm tra đủ thông tin tối thiểu để publish CV */
    public boolean isCompleteEnoughToPublish() {
        return fullName != null && !fullName.isBlank()
                && email != null && !email.isBlank();
    }
}