package edu.tlu.jobplatform.ai.application.usecase;

import edu.tlu.jobplatform.ai.domain.model.CandidateProfileSummary;
import edu.tlu.jobplatform.ai.domain.model.CandidateSearchRequest;
import edu.tlu.jobplatform.ai.domain.model.CandidateSearchResult;
import edu.tlu.jobplatform.ai.domain.port.CandidateSearchPort;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

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
                                .map(CandidateSummaryMapper::toSummary)
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

        public record Command(
                        UUID employerId,
                        String query,
                        String jobTitle,
                        String requirements,
                        String level,
                        String location,
                        List<String> requiredSkills, // ← skill cấu trúc từ caller
                        int maxResults) {
        }
}