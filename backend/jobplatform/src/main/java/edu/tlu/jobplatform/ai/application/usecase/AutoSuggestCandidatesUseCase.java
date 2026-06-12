package edu.tlu.jobplatform.ai.application.usecase;

import edu.tlu.jobplatform.ai.domain.model.CandidateProfileSummary;
import edu.tlu.jobplatform.ai.domain.model.CandidateSearchRequest;
import edu.tlu.jobplatform.ai.domain.model.CandidateSearchResult;
import edu.tlu.jobplatform.ai.domain.port.CandidateAutoSuggestPort;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.model.DesiredJob;
import edu.tlu.jobplatform.candidate.domain.model.Skill;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.JobPostSkill;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutoSuggestCandidatesUseCase {

    private final CandidateProfileRepository candidateRepo;
    private final JobPostRepository jobPostRepo;
    private final CandidateAutoSuggestPort autoSuggestPort;

    // Cache 1 giờ — auto suggest không cần real-time
    @Cacheable(value = "candidateSuggestions", key = "#jobPostId")
    public CandidateSearchResult execute(UUID jobPostId) {
        JobPost job = jobPostRepo.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        List<CandidateProfileSummary> pool = candidateRepo
                .findByJobSearchStatusIn(
                        List.of("ACTIVELY_LOOKING", "OPEN_TO_OFFERS"),
                        PageRequest.of(0, 200))
                .stream()
                .map(this::toSummary)
                .toList();

        // ── Lấy danh sách skill có cấu trúc từ JobPost ──────────────────────
        // Ưu tiên skill đánh dấu required=true; nếu không có thì lấy hết.
        List<String> requiredSkills = job.getSkills().stream()
                .filter(JobPostSkill::isRequired)
                .map(JobPostSkill::getSkillName)
                .toList();

        if (requiredSkills.isEmpty()) {
            requiredSkills = job.getSkills().stream()
                    .map(JobPostSkill::getSkillName)
                    .toList();
        }

        CandidateSearchRequest request = CandidateSearchRequest.builder()
                .jobPostId(jobPostId)
                .jobTitle(job.getTitle())
                .jobRequirements(job.getRequirements())
                .jobLevel(job.getLevel())
                .requiredSkills(requiredSkills) // ← truyền skill cấu trúc
                .location(job.getWorkLocation() != null
                        ? job.getWorkLocation().getCity()
                        : null)
                .maxResults(10)
                .build();

        return autoSuggestPort.suggest(request, pool);
    }

    private CandidateProfileSummary toSummary(CandidateProfile p) {
        return CandidateProfileSummary.builder()
                .id(p.getId())
                .fullName(p.getFirstName() + " " + p.getLastName())
                .headline(p.getHeadline())
                .location(p.getLocation())
                .jobSearchStatus(p.getJobSearchStatus() != null
                        ? p.getJobSearchStatus().name()
                        : "")
                .skills(p.getSkills().stream().map(Skill::getName).toList())
                .levelSummary(p.getDesiredJobs().stream().findFirst()
                        .map(dj -> dj.getLevels().stream()
                                .map(DesiredJob.Level::name)
                                .collect(Collectors.joining("/")))
                        .orElse(""))
                .educationSummary(p.getEducations().stream().findFirst()
                        .map(e -> e.getDegree() + " - " + e.getMajor()).orElse(""))
                .totalExperienceYears(p.getExperiences().size() * 2)
                .build();
    }
}