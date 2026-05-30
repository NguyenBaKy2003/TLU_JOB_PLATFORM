package edu.tlu.jobplatform.cv.application.usecase;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.cv.application.port.out.CandidateProfileQueryPort;
import edu.tlu.jobplatform.cv.application.port.out.CandidateProfileQueryPort.EducationItem;
import edu.tlu.jobplatform.cv.application.port.out.CandidateProfileQueryPort.ExperienceItem;
import edu.tlu.jobplatform.cv.application.port.out.CandidateProfileQueryPort.LanguageItem;
import edu.tlu.jobplatform.cv.application.port.out.CandidateProfileQueryPort.ProfileSnapshot;
import edu.tlu.jobplatform.cv.application.port.out.CandidateProfileQueryPort.SkillItem;
import edu.tlu.jobplatform.cv.application.port.out.CandidateProfileQueryPort.SocialLinkItem;
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

import java.util.*;

/**
 * Import dữ liệu từ CandidateProfile vào CV online.
 *
 * Rules:
 * - PersonalInfo: chỉ overwrite field có giá trị từ profile,
 * giữ nguyên field hiện tại của CV nếu profile trống.
 * - Sections: upsert theo SectionType (update nếu đã có, add nếu chưa).
 * - Chỉ serialize field != null/blank; bỏ boolean false.
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

        // getProfileSnapshot chạy trong REQUIRES_NEW → entity profile detach
        // trước khi transaction này flush → không gây dirty-check candidate_skills
        ProfileSnapshot snapshot = profileQueryPort.getProfileSnapshot(candidateId);

        // ── PersonalInfo — chỉ overwrite field có giá trị ─────────────────
        PersonalInfo existing = cv.getPersonalInfo();
        PersonalInfo personalInfo = PersonalInfo.builder()
                .fullName(firstNonBlank(snapshot.fullName(),
                        existing != null ? existing.getFullName() : null))
                .email(firstNonBlank(snapshot.email(),
                        existing != null ? existing.getEmail() : null))
                .phone(firstNonBlank(snapshot.phone(),
                        existing != null ? existing.getPhone() : null))
                .headline(firstNonBlank(snapshot.headline(),
                        existing != null ? existing.getHeadline() : null))
                .avatarUrl(firstNonBlank(snapshot.avatarUrl(),
                        existing != null ? existing.getAvatarUrl() : null))
                .address(firstNonBlank(snapshot.location(),
                        existing != null ? existing.getAddress() : null))
                .build();

        cv.updateMetadata(cv.getTitle(), personalInfo, cv.getTemplateId(), cv.getVisibility());

        // ── SUMMARY ───────────────────────────────────────────────────────
        if (hasText(snapshot.summary())) {
            upsertSection(cv, SectionType.SUMMARY, "Giới thiệu bản thân",
                    toJson(Map.of("text", snapshot.summary())));
        }

        // ── EXPERIENCE ────────────────────────────────────────────────────
        if (!isEmpty(snapshot.experiences())) {
            List<Map<String, Object>> list = snapshot.experiences().stream()
                    .map(ImportFromProfileUseCase::mapExperience)
                    .toList();
            upsertSection(cv, SectionType.EXPERIENCE, "Kinh nghiệm làm việc", toJson(list));
        }

        // ── EDUCATION ─────────────────────────────────────────────────────
        if (!isEmpty(snapshot.educations())) {
            List<Map<String, Object>> list = snapshot.educations().stream()
                    .map(ImportFromProfileUseCase::mapEducation)
                    .toList();
            upsertSection(cv, SectionType.EDUCATION, "Học vấn", toJson(list));
        }

        // ── SKILL ─────────────────────────────────────────────────────────
        if (!isEmpty(snapshot.skills())) {
            List<String> names = snapshot.skills().stream()
                    .map(SkillItem::name)
                    .filter(ImportFromProfileUseCase::hasText)
                    .distinct()
                    .toList();
            if (!names.isEmpty()) {
                upsertSection(cv, SectionType.SKILL, "Kỹ năng", toJson(names));
            }
        }

        // ── LANGUAGE ──────────────────────────────────────────────────────
        if (!isEmpty(snapshot.languages())) {
            List<Map<String, Object>> list = snapshot.languages().stream()
                    .map(ImportFromProfileUseCase::mapLanguage)
                    .toList();
            upsertSection(cv, SectionType.LANGUAGE, "Ngoại ngữ", toJson(list));
        }

        // ── SOCIAL LINK ───────────────────────────────────────────────────
        if (!isEmpty(snapshot.socialLinks())) {
            List<Map<String, Object>> list = snapshot.socialLinks().stream()
                    .map(ImportFromProfileUseCase::mapSocialLink)
                    .toList();
            upsertSection(cv, SectionType.SOCIAL_LINK, "Mạng xã hội", toJson(list));
        }

        OnlineCV saved = cvRepository.save(cv);
        log.info("OnlineCV imported from profile: cvId={} candidateId={}", cvId, candidateId);
        return saved;
    }

    // ── Mappers — chỉ giữ field có giá trị ──────────────────────────────────

    private static Map<String, Object> mapExperience(ExperienceItem exp) {
        Map<String, Object> m = new LinkedHashMap<>();
        putIfPresent(m, "company", exp.companyName());
        putIfPresent(m, "position", exp.position());
        putIfPresent(m, "startDate", exp.startDate());
        putIfPresent(m, "endDate", exp.endDate());
        putIfPresent(m, "current", exp.current());
        putIfPresent(m, "description", exp.description());
        return m;
    }

    private static Map<String, Object> mapEducation(EducationItem edu) {
        Map<String, Object> m = new LinkedHashMap<>();
        putIfPresent(m, "school", edu.school());
        putIfPresent(m, "degree", edu.degree());
        putIfPresent(m, "major", edu.major());
        putIfPresent(m, "startDate", edu.startDate());
        putIfPresent(m, "endDate", edu.endDate());
        return m;
    }

    private static Map<String, Object> mapLanguage(LanguageItem lang) {
        Map<String, Object> m = new LinkedHashMap<>();
        putIfPresent(m, "name", lang.name());
        putIfPresent(m, "level", lang.level());
        return m;
    }

    private static Map<String, Object> mapSocialLink(SocialLinkItem link) {
        Map<String, Object> m = new LinkedHashMap<>();
        putIfPresent(m, "platform", link.platform());
        putIfPresent(m, "url", link.url());
        return m;
    }

    // ── Section upsert ────────────────────────────────────────────────────────

    /** Update nếu section đã tồn tại, add mới nếu chưa có. */
    private void upsertSection(OnlineCV cv, SectionType type, String title, String content) {
        cv.getSections().stream()
                .filter(s -> s.getType() == type)
                .findFirst()
                .ifPresentOrElse(
                        existing -> cv.updateSection(
                                existing.getId(), title, content, existing.isVisible()),
                        () -> cv.addSection(type, title, content));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Trả về value đầu tiên có nội dung, hoặc null nếu tất cả đều blank.
     * Dùng để merge personalInfo: ưu tiên dữ liệu mới từ profile,
     * fallback sang giá trị hiện tại của CV.
     */
    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank())
                return v;
        }
        return null;
    }

    /** Chỉ đưa vào map nếu value != null, != blank string, != false. */
    private static void putIfPresent(Map<String, Object> map, String key, Object value) {
        if (value == null)
            return;
        if (value instanceof String s && s.isBlank())
            return;
        if (value instanceof Boolean b && !b)
            return; // bỏ current=false
        map.put(key, value);
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    private static boolean isEmpty(Collection<?> c) {
        return c == null || c.isEmpty();
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