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
        private final CompanyRepository companyRepo; // chỉ dùng cho recommendCompanies

        @Value("classpath:prompts/job-recommend.st")
        private Resource promptTemplate;

        @Value("classpath:prompts/company-recommend.st")
        private Resource companyPromptTemplate;

        public OpenAIJobRecommendAdapter(
                        @Qualifier("jsonChatClient") ChatClient chatClient,
                        ObjectMapper objectMapper,
                        CompanyRepository companyRepo) {
                this.chatClient = chatClient;
                this.objectMapper = objectMapper;
                this.companyRepo = companyRepo;
                // JobPostRepository đã bị xóa — job pool được inject qua CandidateTrendRequest
        }

        // ── recommendJobs ─────────────────────────────────────────────────────────

        @Override
        public JobRecommendResult recommendJobs(CandidateTrendRequest req) {
                log.info("Job recommendation: candidateId={}", req.getCandidateId());
                try {
                        // Lấy job pool và company map từ request — không query DB ở đây
                        List<JobPost> openJobs = req.getPublishedJobs();
                        Map<UUID, String> companyNameMap = req.getCompanyNameMap();

                        if (openJobs.isEmpty()) {
                                log.info("No published jobs found, skipping AI recommendation");
                                return emptyJobResult();
                        }

                        boolean hasNoHistory = req.getRecentKeywords().isEmpty()
                                        && req.getViewedJobTitles().isEmpty()
                                        && req.getAppliedJobTitles().isEmpty()
                                        && req.getSavedJobTitles().isEmpty()
                                        && req.getCandidateSkills().isEmpty();

                        if (hasNoHistory) {
                                log.info("No candidate history, returning top new jobs");
                                return buildTopJobsResult(openJobs, companyNameMap);
                        }

                        // ── Gọi AI ───────────────────────────────────────────────────────
                        String jobPool = openJobs.stream()
                                        .map(j -> "[%s] %s — %s — %s".formatted(
                                                        j.getId(), j.getTitle(),
                                                        nullSafe(j.getLevel()), nullSafe(j.getCategory())))
                                        .collect(Collectors.joining("\n"));

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
                                        .map(JobPost::getId).collect(Collectors.toSet());
                        Map<UUID, JobPost> jobMap = openJobs.stream()
                                        .collect(Collectors.toMap(JobPost::getId, j -> j));

                        List<JobRecommendResult.RecommendedJob> validJobs = result.getJobs().stream()
                                        .filter(j -> j.getJobPostId() != null && validIds.contains(j.getJobPostId()))
                                        .map(j -> {
                                                JobPost db = jobMap.get(j.getJobPostId());
                                                return JobRecommendResult.RecommendedJob.builder()
                                                                .jobPostId(j.getJobPostId())
                                                                .jobTitle(db.getTitle())
                                                                .companyName(companyNameMap
                                                                                .getOrDefault(db.getCompanyId(), ""))
                                                                .matchScore(j.getMatchScore())
                                                                .matchReason(j.getMatchReason())
                                                                .urgencySignal(j.getUrgencySignal())
                                                                .isNew(j.isNew())
                                                                .build();
                                        })
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

        // ── recommendCompanies ────────────────────────────────────────────────────

        @Override
        public CompanyRecommendResult recommendCompanies(CandidateTrendRequest req) {
                log.info("Company recommendation: candidateId={}", req.getCandidateId());
                try {
                        List<CompanyProfile> activeCompanies = companyRepo
                                        .findVerifiedCompaniesWithOpenJobs(Pageable.ofSize(50))
                                        .getContent();

                        if (activeCompanies.isEmpty()) {
                                return CompanyRecommendResult.builder()
                                                .companies(List.of())
                                                .personalitySummary("Chưa có công ty nào đang tuyển dụng.")
                                                .build();
                        }

                        Set<UUID> companyIds = activeCompanies.stream()
                                        .map(CompanyProfile::getId)
                                        .collect(Collectors.toSet());
                        Map<UUID, Long> openJobCounts = companyRepo.countOpenJobsByCompanyIds(companyIds);
                        Map<UUID, CompanyProfile> dbMap = activeCompanies.stream()
                                        .collect(Collectors.toMap(CompanyProfile::getId, c -> c));

                        boolean hasNoHistory = req.getRecentKeywords().isEmpty()
                                        && req.getAppliedJobTitles().isEmpty()
                                        && req.getCandidateSkills().isEmpty();

                        if (hasNoHistory) {
                                log.info("No candidate history, returning top companies by open jobs");
                                List<RecommendedCompany> top = activeCompanies.stream()
                                                .sorted(Comparator.comparingLong(
                                                                c -> -openJobCounts.getOrDefault(c.getId(), 0L)))
                                                .limit(3)
                                                .map(c -> RecommendedCompany.builder()
                                                                .companyId(c.getId())
                                                                .companyName(c.getName())
                                                                .fitScore(50)
                                                                .fitReason("Công ty đang tuyển dụng nhiều vị trí phù hợp")
                                                                .openPositions(List.of())
                                                                .logoUrl(c.getLogoUrl())
                                                                .industry(c.getIndustry())
                                                                .slug(c.getSlug())
                                                                .openJobs(openJobCounts.getOrDefault(c.getId(), 0L)
                                                                                .intValue())
                                                                .build())
                                                .toList();

                                return CompanyRecommendResult.builder()
                                                .companies(top)
                                                .personalitySummary("Các công ty nổi bật đang tuyển dụng.")
                                                .build();
                        }

                        // ── Gọi AI ───────────────────────────────────────────────────────
                        String companyPool = activeCompanies.stream()
                                        .map(c -> "[%s] %s — %s — %d vị trí đang tuyển".formatted(
                                                        c.getId(), c.getName(),
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
                                        .replace("$companyPool$", companyPool);

                        String raw = chatClient.prompt().user(prompt).call().content();
                        String clean = stripMarkdown(raw);

                        CompanyRecommendResult aiResult = objectMapper.readValue(clean, CompanyRecommendResult.class);

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

        // ── Helpers ───────────────────────────────────────────────────────────────

        private JobRecommendResult buildTopJobsResult(List<JobPost> jobs,
                        Map<UUID, String> companyNameMap) {
                List<JobRecommendResult.RecommendedJob> top = jobs.stream()
                                .map(j -> JobRecommendResult.RecommendedJob.builder()
                                                .jobPostId(j.getId())
                                                .jobTitle(j.getTitle())
                                                .companyName(companyNameMap.getOrDefault(j.getCompanyId(), ""))
                                                .matchScore(50)
                                                .matchReason("Việc làm mới đăng, có thể phù hợp với bạn")
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