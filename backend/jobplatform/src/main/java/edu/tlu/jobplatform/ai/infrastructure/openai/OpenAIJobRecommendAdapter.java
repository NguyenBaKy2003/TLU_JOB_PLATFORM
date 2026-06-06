package edu.tlu.jobplatform.ai.infrastructure.openai;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.ai.domain.model.CandidateTrendRequest;
import edu.tlu.jobplatform.ai.domain.model.CompanyRecommendResult;
import edu.tlu.jobplatform.ai.domain.model.CompanyRecommendResult.RecommendedCompany;
import edu.tlu.jobplatform.ai.domain.model.JobRecommendResult;
import edu.tlu.jobplatform.ai.domain.port.CandidateTrendAnalysisPort;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@Profile("!test")
public class OpenAIJobRecommendAdapter implements CandidateTrendAnalysisPort {

        private final ChatClient chatClient;
        private final ObjectMapper objectMapper;
        private final JobPostRepository jobPostRepo;
        private final CompanyRepository companyRepo;

        @Value("classpath:prompts/job-recommend.st")
        private Resource promptTemplate;

        @Value("classpath:prompts/company-recommend.st")
        private Resource companyPromptTemplate;

        public OpenAIJobRecommendAdapter(
                        @Qualifier("jsonChatClient") ChatClient chatClient,
                        ObjectMapper objectMapper,
                        JobPostRepository jobPostRepo,
                        CompanyRepository companyRepo) {
                this.chatClient = chatClient;
                this.objectMapper = objectMapper;
                this.jobPostRepo = jobPostRepo;
                this.companyRepo = companyRepo;
        }
        // ── recommendJobs ────

        @Override
        public JobRecommendResult recommendJobs(CandidateTrendRequest req) {
                log.info("Job recommendation: candidateId={}", req.getCandidateId());
                try {
                        List<JobPost> openJobs = jobPostRepo
                                        .findPublished(Pageable.ofSize(50))
                                        .getContent();

                        if (openJobs.isEmpty()) {
                                log.info("No published jobs found, skipping AI recommendation");
                                return emptyJobResult();
                        }

                        String jobPool = openJobs.stream()
                                        .map(j -> "[%s] %s — %s — %s".formatted(
                                                        j.getId(), j.getTitle(),
                                                        nullSafe(j.getLevel()), nullSafe(j.getCategory())))
                                        .collect(Collectors.joining("\n"));

                        boolean hasNoHistory = req.getRecentKeywords().isEmpty()
                                        && req.getViewedJobTitles().isEmpty()
                                        && req.getAppliedJobTitles().isEmpty()
                                        && req.getSavedJobTitles().isEmpty();

                        if (hasNoHistory && req.getCandidateSkills().isEmpty()) {
                                log.info("No candidate history, returning top jobs");
                                return buildTopJobsResult(openJobs);
                        }

                        String prompt = promptTemplate
                                        .getContentAsString(StandardCharsets.UTF_8)
                                        .replace("$keywords$", joinOrNone(req.getRecentKeywords()))
                                        .replace("$viewedJobs$", joinOrNone(req.getViewedJobTitles()))
                                        .replace("$appliedJobs$", joinOrNone(req.getAppliedJobTitles()))
                                        .replace("$savedJobs$", joinOrNone(req.getSavedJobTitles()))
                                        .replace("$skills$", joinOrNone(req.getCandidateSkills()))
                                        .replace("$level$", nullSafe(req.getCandidateLevel()))
                                        .replace("$location$", nullSafe(req.getCandidateLocation()))
                                        .replace("$jobPool$", jobPool);

                        String raw = chatClient.prompt().user(prompt).call().content();
                        String clean = stripMarkdown(raw);

                        JobRecommendResult result = objectMapper.readValue(clean, JobRecommendResult.class);

                        Set<UUID> validIds = openJobs.stream()
                                        .map(JobPost::getId)
                                        .collect(Collectors.toSet());

                        List<JobRecommendResult.RecommendedJob> validJobs = result.getJobs().stream()
                                        .filter(j -> j.getJobPostId() != null && validIds.contains(j.getJobPostId()))
                                        .limit(6)
                                        .toList();

                        return JobRecommendResult.builder()
                                        .jobs(validJobs)
                                        .inferredGoals(result.getInferredGoals())
                                        .careerStage(result.getCareerStage())
                                        .searchPatternSummary(result.getSearchPatternSummary())
                                        .build();

                } catch (Exception e) {
                        log.error("Job recommendation failed: {}", e.getMessage());
                        return emptyJobResult();
                }
        }

        // ── recommendCompanies ────────────────────────────────────────────────

        @Override
        public CompanyRecommendResult recommendCompanies(CandidateTrendRequest req) {
                log.info("Company recommendation: candidateId={}", req.getCandidateId());
                try {
                        boolean hasNoHistory = req.getRecentKeywords().isEmpty()
                                        && req.getAppliedJobTitles().isEmpty()
                                        && req.getCandidateSkills().isEmpty();

                        if (hasNoHistory) {
                                return CompanyRecommendResult.builder()
                                                .companies(List.of())
                                                .personalitySummary("Chưa đủ dữ liệu phân tích.")
                                                .build();
                        }

                        List<CompanyProfile> activeCompanies = companyRepo
                                        .findVerifiedCompaniesWithOpenJobs(Pageable.ofSize(50))
                                        .getContent();

                        if (activeCompanies.isEmpty()) {
                                return CompanyRecommendResult.builder()
                                                .companies(List.of())
                                                .personalitySummary("Chưa có công ty nào đang tuyển dụng.")
                                                .build();
                        }

                        // Đếm open jobs để đưa vào pool
                        Set<UUID> companyIds = activeCompanies.stream()
                                        .map(CompanyProfile::getId)
                                        .collect(Collectors.toSet());
                        Map<UUID, Long> openJobCounts = companyRepo.countOpenJobsByCompanyIds(companyIds);

                        // Format pool: [uuid] CompanyName — industry — N vị trí đang tuyển
                        String companyPool = activeCompanies.stream()
                                        .map(c -> "[%s] %s — %s — %d vị trí đang tuyển".formatted(
                                                        c.getId(),
                                                        c.getName(),
                                                        nullSafe(c.getIndustry()),
                                                        openJobCounts.getOrDefault(c.getId(), 0L).intValue()))
                                        .collect(Collectors.joining("\n"));

                        String prompt = companyPromptTemplate
                                        .getContentAsString(StandardCharsets.UTF_8)
                                        .replace("$keywords$", joinOrNone(req.getRecentKeywords()))
                                        .replace("$appliedJobs$", joinOrNone(req.getAppliedJobTitles()))
                                        .replace("$viewedJobs$", joinOrNone(req.getViewedJobTitles()))
                                        .replace("$savedJobs$", joinOrNone(req.getSavedJobTitles()))
                                        .replace("$skills$", joinOrNone(req.getCandidateSkills()))
                                        .replace("$level$", nullSafe(req.getCandidateLevel()))
                                        .replace("$location$", nullSafe(req.getCandidateLocation()))
                                        .replace("$companyPool$", companyPool); // ← thêm

                        String raw = chatClient.prompt().user(prompt).call().content();
                        String clean = stripMarkdown(raw);

                        CompanyRecommendResult aiResult = objectMapper.readValue(clean, CompanyRecommendResult.class);

                        // ── Validate + enrich từ DB map (AI đã có UUID, chỉ cần lấy logoUrl, slug) ──
                        Map<UUID, CompanyProfile> dbMap = activeCompanies.stream()
                                        .collect(Collectors.toMap(CompanyProfile::getId, c -> c));

                        List<RecommendedCompany> validated = aiResult.getCompanies().stream()
                                        .filter(ai -> ai.getCompanyId() != null && dbMap.containsKey(ai.getCompanyId()))
                                        .map(ai -> {
                                                CompanyProfile db = dbMap.get(ai.getCompanyId());
                                                return RecommendedCompany.builder()
                                                                .companyId(db.getId())
                                                                .companyName(db.getName()) // lấy từ DB, không tin AI
                                                                .fitScore(ai.getFitScore())
                                                                .fitReason(ai.getFitReason())
                                                                .openPositions(ai.getOpenPositions())
                                                                .logoUrl(db.getLogoUrl())
                                                                .industry(db.getIndustry())
                                                                .slug(db.getSlug())
                                                                .openJobs(openJobCounts.getOrDefault(db.getId(), 0L)
                                                                                .intValue())
                                                                .build();
                                        })
                                        .limit(3)
                                        .toList();

                        return CompanyRecommendResult.builder()
                                        .companies(validated)
                                        .personalitySummary(aiResult.getPersonalitySummary())
                                        .build();

                } catch (Exception e) {
                        log.error("Company recommendation failed: {}", e.getMessage());
                        return CompanyRecommendResult.builder()
                                        .companies(List.of())
                                        .personalitySummary("Không thể phân tích.")
                                        .build();
                }
        }

        // ── Helpers ──────────

        private JobRecommendResult buildTopJobsResult(List<JobPost> jobs) {
                List<JobRecommendResult.RecommendedJob> top = jobs.stream()
                                .limit(6)
                                .map(j -> JobRecommendResult.RecommendedJob.builder()
                                                .jobPostId(j.getId())
                                                .jobTitle(j.getTitle())
                                                .companyName("")
                                                .matchScore(50)
                                                .matchReason("Job mới đăng phù hợp với kỹ năng của bạn")
                                                .urgencySignal("Mới đăng")
                                                .isNew(true)
                                                .build())
                                .toList();

                return JobRecommendResult.builder()
                                .jobs(top)
                                .inferredGoals(List.of())
                                .careerStage("EXPLORING")
                                .searchPatternSummary("Chưa đủ dữ liệu phân tích hành vi")
                                .build();
        }

        private JobRecommendResult emptyJobResult() {
                return JobRecommendResult.builder()
                                .jobs(List.of())
                                .inferredGoals(List.of())
                                .careerStage("UNKNOWN")
                                .searchPatternSummary("Không thể phân tích.")
                                .build();
        }

        private String stripMarkdown(String raw) {
                return raw.trim()
                                .replaceAll("(?s)^```json\\s*", "")
                                .replaceAll("(?s)```\\s*$", "")
                                .trim();
        }

        private String joinOrNone(List<String> list) {
                return list == null || list.isEmpty() ? "(chưa có)" : String.join(", ", list);
        }

        private String nullSafe(String s) {
                return s != null ? s : "";
        }
}