package edu.tlu.jobplatform.ai.infrastructure.openai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import edu.tlu.jobplatform.ai.domain.model.CandidateProfileSummary;
import edu.tlu.jobplatform.ai.domain.model.CandidateSearchRequest;
import edu.tlu.jobplatform.ai.domain.model.CandidateSearchResult;
import edu.tlu.jobplatform.ai.domain.port.CandidateAutoSuggestPort;
import edu.tlu.jobplatform.ai.domain.port.CandidateSearchPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@Profile("!test")
public class OpenAICandidateSearchAdapter
        implements CandidateSearchPort, CandidateAutoSuggestPort {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Value("classpath:prompts/candidate-search.st")
    private Resource searchPromptTemplate;

    @Value("classpath:prompts/candidate-autosuggest.st")
    private Resource autosuggestPromptTemplate;

    public OpenAICandidateSearchAdapter(
            @Qualifier("jsonChatClient") ChatClient chatClient,
            ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public CandidateSearchResult search(CandidateSearchRequest req,
            List<CandidateProfileSummary> pool) {
        log.info("Smart candidate search: employerId={} query='{}'",
                req.getEmployerId(), req.getNaturalQuery());
        return callAI(searchPromptTemplate, req, pool);
    }

    @Override
    public CandidateSearchResult suggest(CandidateSearchRequest req,
            List<CandidateProfileSummary> pool) {
        log.info("Auto suggest candidates: jobPostId={}", req.getJobPostId());
        return callAI(autosuggestPromptTemplate, req, pool);
    }

    private CandidateSearchResult callAI(Resource template,
            CandidateSearchRequest req,
            List<CandidateProfileSummary> pool) {
        try {
            // ── Build candidate pool string ──────────────────────────────────
            String candidatePool = pool.stream()
                    .map(c -> "[%s] %s | %s | %s | Skills: %s | Exp: %s".formatted(
                            c.getId(), c.getFullName(), c.getHeadline(),
                            nullSafe(c.getLocation()),
                            String.join(", ", c.getSkills()),
                            nullSafe(c.getLevelSummary())))
                    .collect(Collectors.joining("\n"));

            // ── Build requiredSkills string cho prompt ───────────────────────
            // Nếu caller truyền danh sách skill có cấu trúc thì dùng;
            // ngược lại báo AI suy ra từ phần requirements.
            String requiredSkillsText = (req.getRequiredSkills() != null
                    && !req.getRequiredSkills().isEmpty())
                            ? String.join(", ", req.getRequiredSkills())
                            : "(không có — hãy suy ra từ phần Yêu cầu công việc)";

            String prompt = template
                    .getContentAsString(StandardCharsets.UTF_8)
                    .replace("$query$", nullSafe(req.getNaturalQuery()))
                    .replace("$jobTitle$", nullSafe(req.getJobTitle()))
                    .replace("$requirements$", truncate(nullSafe(req.getJobRequirements()), 1500))
                    .replace("$level$", nullSafe(req.getJobLevel()))
                    .replace("$location$", nullSafe(req.getLocation()))
                    .replace("$requiredSkills$", requiredSkillsText) // ← MỚI
                    .replace("$maxResults$", String.valueOf(req.getMaxResults()))
                    .replace("$candidatePool$", candidatePool);

            String raw = chatClient.prompt().user(prompt).call().content();
            String clean = raw.trim()
                    .replaceAll("(?s)^```json\\s*", "")
                    .replaceAll("(?s)```\\s*$", "").trim();

            // ── Parse & sanitize ─────────────────────────────────────────────
            ObjectNode root = (ObjectNode) objectMapper.readTree(clean);
            sanitizeStringField(root, "searchSummary");

            JsonNode tips = root.get("refinementTips");
            if (tips != null && tips.isArray()) {
                ArrayNode cleanTips = objectMapper.createArrayNode();
                tips.forEach(tip -> cleanTips.add(tip.isTextual()
                        ? tip.asText()
                        : tip.isObject() && tip.fields().hasNext()
                                ? tip.fields().next().getValue().asText()
                                : tip.toString()));
                root.set("refinementTips", cleanTips);
            }

            JsonNode candidates = root.get("candidates");
            if (candidates != null && candidates.isArray()) {
                candidates.forEach(c -> {
                    if (c instanceof ObjectNode candidate) {
                        sanitizeStringField(candidate, "matchReason");
                        sanitizeStringField(candidate, "experienceSummary");
                        sanitizeStringField(candidate, "candidateName");
                    }
                });
            }

            CandidateSearchResult result = objectMapper.treeToValue(root, CandidateSearchResult.class);

            // ── Lọc bỏ candidateId không tồn tại trong pool ─────────────────
            Set<UUID> validIds = pool.stream()
                    .map(CandidateProfileSummary::getId)
                    .collect(Collectors.toSet());

            List<CandidateSearchResult.MatchedCandidate> valid = result.getCandidates()
                    .stream()
                    .filter(c -> c.getCandidateProfileId() != null
                            && validIds.contains(c.getCandidateProfileId()))
                    .sorted(Comparator.comparingInt(
                            CandidateSearchResult.MatchedCandidate::getMatchScore).reversed())
                    .limit(req.getMaxResults())
                    .toList();

            // ── Override matchedSkills / missingSkills bằng so khớp thật ────
            // Không tin AI tính — tự tính để đảm bảo chính xác 100%.
            if (req.getRequiredSkills() != null && !req.getRequiredSkills().isEmpty()) {

                // Index: candidateId → Set<skillName lowercase>
                Map<UUID, Set<String>> skillsById = pool.stream()
                        .collect(Collectors.toMap(
                                CandidateProfileSummary::getId,
                                c -> c.getSkills().stream()
                                        .map(s -> s.toLowerCase().trim())
                                        .collect(Collectors.toSet())));

                List<String> required = req.getRequiredSkills();

                valid.forEach(c -> {
                    Set<String> have = skillsById.getOrDefault(
                            c.getCandidateProfileId(), Set.of());

                    c.setMatchedSkills(required.stream()
                            .filter(rs -> have.contains(rs.toLowerCase().trim()))
                            .toList());

                    c.setMissingSkills(required.stream()
                            .filter(rs -> !have.contains(rs.toLowerCase().trim()))
                            .toList());
                });
            }

            return CandidateSearchResult.builder()
                    .candidates(valid)
                    .searchSummary(result.getSearchSummary())
                    .refinementTips(result.getRefinementTips())
                    .totalScanned(pool.size())
                    .build();

        } catch (Exception e) {
            log.error("Candidate search AI failed: {}", e.getMessage());
            return CandidateSearchResult.builder()
                    .candidates(List.of())
                    .searchSummary("Không thể tìm kiếm tự động.")
                    .refinementTips(List.of())
                    .totalScanned(0)
                    .build();
        }
    }

    private void sanitizeStringField(ObjectNode node, String fieldName) {
        JsonNode field = node.get(fieldName);
        if (field == null || field.isTextual())
            return;

        if (field.isObject()) {
            String text = field.has("text") ? field.get("text").asText()
                    : field.has("summary") ? field.get("summary").asText()
                            : field.has("content") ? field.get("content").asText()
                                    : field.fields().hasNext()
                                            ? field.fields().next().getValue().asText()
                                            : "";
            node.put(fieldName, text);
        } else if (field.isArray()) {
            ArrayNode arr = (ArrayNode) field;
            StringBuilder sb = new StringBuilder();
            arr.forEach(e -> {
                if (sb.length() > 0)
                    sb.append(", ");
                sb.append(e.isTextual() ? e.asText() : e.toString());
            });
            node.put(fieldName, sb.toString());
        } else {
            node.put(fieldName, field.asText(""));
        }
    }

    private String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max) + "...[truncated]";
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }
}