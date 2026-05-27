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
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

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

    // Cache 10 phút để tránh gọi AI liên tục khi candidate reload
    @Cacheable(value = "passProbability", key = "#cmd.candidateId + ':' + #cmd.jobPostId")
    public PassProbabilityResult execute(Command cmd) {
        JobPost job = jobPostRepo.findById(cmd.jobPostId())
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", cmd.jobPostId()));

        CandidateProfile candidate = candidateRepo.findByUserId(cmd.candidateId())
                .orElseThrow(() -> ResourceNotFoundException.of("Candidate", cmd.candidateId()));

        // Extract CV text
        String cvText = cvRepo.findPrimaryByCandidateId(cmd.candidateId())
                .map(CandidateCV::getFileUrl)
                .map(pdfExtractor::extractFromUrl)
                .orElse("");

        // Lấy lịch sử apply
        int totalApply = applicationRepo.countByCandidateId(cmd.candidateId());
        int totalPass = applicationRepo.countInterviewedByCandidateId(cmd.candidateId());

        // Tính profile completeness
        int completeness = calculateProfileCompleteness(candidate);

        PassProbabilityRequest request = PassProbabilityRequest.builder()
                .candidateId(cmd.candidateId())
                .jobPostId(cmd.jobPostId())
                .cvText(cvText)
                .jobTitle(job.getTitle())
                .jobDescription(job.getDescription())
                .jobRequirements(job.getRequirements())
                .jobLevel(job.getLevel() != null ? job.getLevel() : null)
                .currentApplicantCount(applicationRepo.countByJobPostId(cmd.jobPostId()))
                .hiringQuota(0)
                .historicalApplyCount(totalApply)
                .historicalPassCount(totalPass)
                .profileCompleteness(completeness)
                .build();

        return probabilityPort.calculate(request);
    }

    private int calculateProfileCompleteness(CandidateProfile c) {
        int score = 0;
        if (c.getAvatarUrl() != null)
            score += 10;
        if (c.getPhone() != null)
            score += 10;
        if (c.getSummary() != null && c.getSummary().length() > 50)
            score += 20;
        if (!c.getSkills().isEmpty())
            score += 20;
        if (!c.getExperiences().isEmpty())
            score += 20;
        if (!c.getEducations().isEmpty())
            score += 20;
        return Math.min(score, 100);
    }

    public record Command(UUID candidateId, UUID jobPostId) {
    }
}
