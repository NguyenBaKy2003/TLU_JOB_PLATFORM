package edu.tlu.jobplatform.cv.presentation.dto.response;

import edu.tlu.jobplatform.cv.domain.model.vo.PersonalInfo;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PersonalInfoResponse {

    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String avatarUrl;
    private String headline;
    private String linkedIn;
    private String github;
    private String website;

    public static PersonalInfoResponse from(PersonalInfo pi) {
        if (pi == null)
            return null;
        return PersonalInfoResponse.builder()
                .fullName(pi.getFullName())
                .email(pi.getEmail())
                .phone(pi.getPhone())
                .address(pi.getAddress())
                .avatarUrl(pi.getAvatarUrl())
                .headline(pi.getHeadline())
                .linkedIn(pi.getLinkedIn())
                .github(pi.getGithub())
                .website(pi.getWebsite())
                .build();
    }
}