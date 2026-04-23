package edu.tlu.jobplatform.cv.application.usecase;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.cv.application.port.out.CandidateProfileQueryPort;
import edu.tlu.jobplatform.cv.application.port.out.CandidateProfileQueryPort.ProfileSnapshot;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.PersonalInfo;
import edu.tlu.jobplatform.cv.domain.model.vo.SectionType;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Import dữ liệu từ CandidateProfile vào CV online.
 *
 * Hành vi:
 * - PersonalInfo được cập nhật từ profile (fullName, email, phone, avatarUrl,
 * headline)
 * - Mỗi loại dữ liệu (experience, education, skill) được thêm vào section tương
 * ứng
 * - Nếu section đã tồn tại → ghi đè content
 * - Nếu chưa có section → tạo mới
 * - CV phải ở trạng thái DRAFT hoặc PUBLISHED (không phải ARCHIVED)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImportFromProfileUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVDomainService cvDomainService;
    private final CandidateProfileQueryPort profileQueryPort;
    private final ObjectMapper objectMapper;

    @Transactional
    public OnlineCV execute(UUID cvId, UUID candidateId) {
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cvId, candidateId);

        ProfileSnapshot snapshot = profileQueryPort.getProfileSnapshot(candidateId);

        // Cập nhật PersonalInfo
        PersonalInfo personalInfo = PersonalInfo.builder()
                .fullName(snapshot.fullName())
                .email(snapshot.email())
                .phone(snapshot.phone())
                .headline(snapshot.headline())
                .avatarUrl(snapshot.avatarUrl())
                .address(snapshot.location())
                .build();

        cv.updateMetadata(cv.getTitle(), personalInfo, cv.getTemplateId(), cv.getVisibility());

        // Import SUMMARY
        if (snapshot.summary() != null && !snapshot.summary().isBlank()) {
            upsertSection(cv, SectionType.SUMMARY, "Giới thiệu bản thân",
                    toJson(Map.of("text", snapshot.summary())));
        }

        // Import EXPERIENCE
        if (!snapshot.experiences().isEmpty()) {
            upsertSection(cv, SectionType.EXPERIENCE, "Kinh nghiệm làm việc",
                    toJson(snapshot.experiences()));
        }

        // Import EDUCATION
        if (!snapshot.educations().isEmpty()) {
            upsertSection(cv, SectionType.EDUCATION, "Học vấn",
                    toJson(snapshot.educations()));
        }

        // Import SKILL
        if (!snapshot.skills().isEmpty()) {
            List<Map<String, String>> skillItems = snapshot.skills().stream()
                    .map(s -> Map.of("name", s))
                    .toList();
            upsertSection(cv, SectionType.SKILL, "Kỹ năng", toJson(skillItems));
        }

        // Import LANGUAGE
        if (!snapshot.languages().isEmpty()) {
            upsertSection(cv, SectionType.LANGUAGE, "Ngoại ngữ",
                    toJson(snapshot.languages()));
        }

        OnlineCV saved = cvRepository.save(cv);
        log.info("OnlineCV imported from profile: cvId={} candidateId={}", cvId, candidateId);
        return saved;
    }

    /** Tìm section theo type → update, hoặc add mới nếu chưa có */
    private void upsertSection(OnlineCV cv, SectionType type, String title, String content) {
        cv.getSections().stream()
                .filter(s -> s.getType() == type)
                .findFirst()
                .ifPresentOrElse(
                        existing -> cv.updateSection(existing.getId(), title, content, existing.isVisible()),
                        () -> cv.addSection(type, title, content));
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            throw new BusinessRuleException(
                    "Lỗi khi xử lý dữ liệu profile.", "PROFILE_SERIALIZE_ERROR");
        }
    }
}