package edu.tlu.jobplatform.ai.application.usecase;

import edu.tlu.jobplatform.ai.domain.model.CandidateComparisonRequest;
import edu.tlu.jobplatform.ai.domain.model.CandidateComparisonResult;
import edu.tlu.jobplatform.ai.domain.port.CandidateComparisonPort;
import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.AIScore;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompareCandidatesUseCase {

    private final ApplicationRepository applicationRepo;
    private final JobPostRepository jobPostRepo;
    private final CandidateProfileRepository candidateProfileRepo;
    private final CandidateComparisonPort comparisonPort;

    public CandidateComparisonResult execute(Command cmd) {
        // Validate input
        if (cmd.applicationIds() == null || cmd.applicationIds().size() < 2) {
            throw new IllegalArgumentException("Cần ít nhất 2 ứng viên để so sánh");
        }
        if (cmd.applicationIds().size() > 10) {
            throw new IllegalArgumentException("Tối đa 10 ứng viên mỗi lần so sánh");
        }

        // Lấy thông tin job
        JobPost job = jobPostRepo.findById(cmd.jobPostId())
                .orElseThrow(() -> ResourceNotFoundException.jobPost(cmd.jobPostId()));

        // Build candidate comparison profiles
        List<CandidateComparisonRequest.CandidateProfile> profiles = cmd.applicationIds()
                .stream()
                .map(this::buildComparisonProfile)
                .toList();

        // Tạo request
        CandidateComparisonRequest request = CandidateComparisonRequest.builder()
                .jobPostId(cmd.jobPostId())
                .jobTitle(job.getTitle())
                .jobRequirements(job.getRequirements())
                .jobLevel(job.getLevel())
                .candidates(profiles)
                .build();

        log.info("Comparing {} candidates for job: {}", profiles.size(), cmd.jobPostId());
        return comparisonPort.compare(request);
    }

    /**
     * Build CandidateComparisonRequest.CandidateProfile từ Application +
     * CandidateProfile
     */
    private CandidateComparisonRequest.CandidateProfile buildComparisonProfile(UUID appId) {
        // Lấy Application
        Application app = applicationRepo.findById(appId)
                .orElseThrow(() -> ResourceNotFoundException.application(appId));

        // Lấy CandidateProfile
        CandidateProfile candidateProfile = candidateProfileRepo.findByUserId(app.getCandidateId())
                .orElseThrow(() -> ResourceNotFoundException.candidate(app.getCandidateId()));

        // Lấy AI score đã tính sẵn (nếu có)
        AIScore score = app.getAiScore();

        if (score == null) {
            log.warn("No AI score found for applicationId={}, using default values", appId);
            return createDefaultComparisonProfile(app, candidateProfile);
        }

        // Build profile với AI score có sẵn
        return CandidateComparisonRequest.CandidateProfile.builder()
                .applicationId(appId)
                .candidateName(candidateProfile.getLastName() + " " + candidateProfile.getFirstName())
                .cvText("")
                .aiScore(score.getScore())
                .skillMatchScore(score.getSkillMatchScore())
                .experienceScore(score.getExperienceScore())
                .educationScore(score.getEducationScore())
                .strengths(score.getStrengths() != null ? score.getStrengths() : List.of())
                .gaps(score.getGaps() != null ? score.getGaps() : List.of())
                .build();
    }

    /**
     * Tạo profile mặc định khi không có AI score
     */
    private CandidateComparisonRequest.CandidateProfile createDefaultComparisonProfile(
            Application app, CandidateProfile candidateProfile) {
        return CandidateComparisonRequest.CandidateProfile.builder()
                .applicationId(app.getId())
                .candidateName(candidateProfile.getLastName() + " " + candidateProfile.getFirstName())
                .cvText("")
                .aiScore(0)
                .skillMatchScore(0)
                .experienceScore(0)
                .educationScore(0)
                .strengths(List.of())
                .gaps(List.of())
                .build();
    }

    public record Command(UUID jobPostId, List<UUID> applicationIds) {
        public Command {
            if (jobPostId == null) {
                throw new IllegalArgumentException("jobPostId không được null");
            }
            if (applicationIds == null) {
                throw new IllegalArgumentException("applicationIds không được null");
            }
        }
    }
}