package edu.tlu.jobplatform.ai.application.usecase;

import edu.tlu.jobplatform.ai.domain.model.CandidateProfileSummary;
import edu.tlu.jobplatform.ai.domain.model.CandidateSearchRequest;
import edu.tlu.jobplatform.ai.domain.model.CandidateSearchResult;
import edu.tlu.jobplatform.ai.domain.port.CandidateSearchPort;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.model.DesiredJob;
import edu.tlu.jobplatform.candidate.domain.model.Skill;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmartSearchCandidatesUseCase {

    private final CandidateProfileRepository candidateRepo;
    private final CandidateSearchPort searchPort;

    public CandidateSearchResult execute(Command cmd) {
        // Lấy pool ứng viên đang tìm việc — giới hạn 200 để không quá tải token
        List<CandidateProfileSummary> pool = candidateRepo
                .findByJobSearchStatusIn(
                        List.of("ACTIVELY_LOOKING", "OPEN_TO_OFFERS"),
                        PageRequest.of(0, 200))
                .stream()
                .map(this::toSummary)
                .toList();

        if (pool.isEmpty()) {
            return CandidateSearchResult.builder()
                    .candidates(List.of())
                    .searchSummary("Hiện tại không có ứng viên đang tìm việc.")
                    .refinementTips(List.of())
                    .totalScanned(0)
                    .build();
        }

        CandidateSearchRequest request = CandidateSearchRequest.builder()
                .employerId(cmd.employerId())
                .naturalQuery(cmd.query())
                .jobTitle(cmd.jobTitle())
                .jobRequirements(cmd.requirements())
                .jobLevel(cmd.level())
                .location(cmd.location())
                .requiredSkills(cmd.requiredSkills()) // ← truyền từ Command
                .maxResults(cmd.maxResults() > 0 ? cmd.maxResults() : 10)
                .build();

        return searchPort.search(request, pool);
    }

    private CandidateProfileSummary toSummary(CandidateProfile p) {
        String levelSummary = p.getDesiredJobs().stream().findFirst()
                .map(dj -> dj.getLevels().stream()
                        .map(DesiredJob.Level::name)
                        .collect(Collectors.joining("/")))
                .orElse("");

        return CandidateProfileSummary.builder()
                .id(p.getId())
                .fullName(p.getFirstName() + " " + p.getLastName())
                .headline(p.getHeadline())
                .location(p.getLocation())
                .jobSearchStatus(p.getJobSearchStatus() != null
                        ? p.getJobSearchStatus().name()
                        : "")
                .skills(p.getSkills().stream()
                        .map(Skill::getName).toList())
                .levelSummary(levelSummary)
                .educationSummary(p.getEducations().stream().findFirst()
                        .map(e -> e.getDegree() + " - " + e.getMajor()).orElse(""))
                .totalExperienceYears(p.getExperiences().size() * 2)
                .build();
    }

    public record Command(
            UUID employerId,
            String query,
            String jobTitle,
            String requirements,
            String level,
            String location,
            List<String> requiredSkills, // ← thêm: skill cấu trúc từ caller
            int maxResults) {
    }
}