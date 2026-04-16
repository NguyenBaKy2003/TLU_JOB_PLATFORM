package edu.tlu.jobplatform.message.presentation.dto.response;

import java.util.UUID;

/**
 * Thông tin tối giản của một participant trong conversation.
 * Employer → fullName = company name, avatarUrl = logo
 * Candidate → fullName = firstName + lastName, avatarUrl = avatarUrl
 */
public record ParticipantInfo(
        UUID id,
        String fullName,
        String avatarUrl) {
}