package edu.tlu.jobplatform.ai.application.usecase;

import edu.tlu.jobplatform.ai.domain.model.PassProbabilityRequest;
import edu.tlu.jobplatform.ai.domain.model.PassProbabilityResult;
import edu.tlu.jobplatform.ai.domain.port.PassProbabilityPort;
import edu.tlu.jobplatform.ai.infrastructure.openai.PdfTextExtractor;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.PersonalInfo;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalculatePassProbabilityUseCase {

    private final CandidateProfileRepository candidateRepo;
    private final JobPostRepository jobPostRepo;
    private final ApplicationRepository applicationRepo;
    private final PdfTextExtractor pdfExtractor;
    private final PassProbabilityPort probabilityPort;
    private final CandidateCVRepository cvRepo;
    private final OnlineCVRepository onlineCVRepo;

    @Cacheable(value = "passProbability", key = "#cmd.candidateId + ':' + #cmd.jobPostId")
    public PassProbabilityResult execute(Command cmd) {
        JobPost job = jobPostRepo.findById(cmd.jobPostId())
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", cmd.jobPostId()));

        CandidateProfile candidate = candidateRepo.findByUserId(cmd.candidateId())
                .orElseThrow(() -> ResourceNotFoundException.of("Candidate", cmd.candidateId()));

        String cvText = extractCvText(cmd.candidateId());
        int completeness = calculateProfileCompleteness(candidate);

        // Guard: CV rỗng + profile chưa hoàn thiện → không gọi AI
        if ((cvText == null || cvText.isBlank()) && completeness < 20) {
            log.info("Skip AI call: no CV and incomplete profile. candidateId={}", cmd.candidateId());
            return PassProbabilityResult.builder()
                    .probability(0.05)
                    .confidenceLevel(PassProbabilityResult.ConfidenceLevel.LOW)
                    .matchScore(0)
                    .strongPoints(List.of())
                    .weakPoints(List.of(
                            "Chưa có CV",
                            "Hồ sơ chưa đủ thông tin"))
                    .improvementTips(List.of())
                    .summary("Vui lòng upload CV và hoàn thiện hồ sơ để được phân tích chính xác.")
                    .build();
        }

        ApplicationRepository.ApplicationStats stats = applicationRepo.getStats(cmd.candidateId(), cmd.jobPostId());

        PassProbabilityRequest request = PassProbabilityRequest.builder()
                .candidateId(cmd.candidateId())
                .jobPostId(cmd.jobPostId())
                .cvText(cvText)
                .jobTitle(job.getTitle())
                .jobDescription(job.getDescription())
                .jobRequirements(job.getRequirements())
                .jobLevel(job.getLevel())
                .currentApplicantCount(stats.currentApplicantCount())
                .hiringQuota(job.getVacancies() != null ? job.getVacancies() : 0)
                .historicalApplyCount(stats.totalApply())
                .historicalPassCount(stats.totalPass())
                .profileCompleteness(completeness)
                .build();

        return probabilityPort.calculate(request);
    }

    private int calculateProfileCompleteness(CandidateProfile c) {
        int score = 0;
        if (c.getAvatarUrl() != null && !c.getAvatarUrl().isBlank())
            score += 10;
        if (c.getPhone() != null && c.getPhone().replaceAll("\\D", "").length() >= 8)
            score += 10;
        if (c.getSummary() != null && c.getSummary().length() > 50)
            score += 20;
        if (c.getSkills() != null && c.getSkills().size() >= 2)
            score += 20;
        if (c.getExperiences() != null && !c.getExperiences().isEmpty())
            score += 20;
        if (c.getEducations() != null && !c.getEducations().isEmpty())
            score += 20;
        return Math.min(score, 100);
    }

    private String extractCvText(UUID candidateId) {
        Optional<String> pdfText = cvRepo.findPrimaryByCandidateId(candidateId)
                .map(CandidateCV::getFileUrl)
                .map(url -> {
                    try {
                        return pdfExtractor.extractFromUrl(url);
                    } catch (Exception e) {
                        log.warn("Failed to extract PDF CV url={} reason={}", url, e.getMessage());
                        return null;
                    }
                });

        if (pdfText.isPresent() && !pdfText.get().isBlank()) {
            return pdfText.get();
        }

        return onlineCVRepo.findPublishedByCandidateId(candidateId)
                .stream()
                .findFirst()
                .map(this::buildTextFromOnlineCV)
                .orElse("");
    }

    private String buildTextFromOnlineCV(OnlineCV cv) {
        StringBuilder sb = new StringBuilder();

        PersonalInfo info = cv.getPersonalInfo();
        if (info != null) {
            if (info.getFullName() != null)
                sb.append("Họ tên: ").append(info.getFullName()).append("\n");
            if (info.getHeadline() != null)
                sb.append("Headline: ").append(info.getHeadline()).append("\n");
            if (info.getEmail() != null)
                sb.append("Email: ").append(info.getEmail()).append("\n");
        }

        cv.getVisibleSections().forEach(section -> {
            sb.append("\n## ").append(section.getTitle()).append("\n");
            if (section.getContent() != null && !section.getContent().isBlank()) {
                sb.append(section.getContent()).append("\n");
            }
        });

        return sb.toString().trim();
    }

    public record Command(UUID candidateId, UUID jobPostId) {
    }
}