package edu.tlu.jobplatform.ai.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.ai.domain.model.AutocompleteResult;
import edu.tlu.jobplatform.ai.domain.port.SearchAutocompletePort;
import edu.tlu.jobplatform.ai.domain.port.SearchEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SmartAutocompleteAdapter implements SearchAutocompletePort {

        private final RedisTemplate<String, String> redisTemplate;
        private final SearchEventRepository searchEventRepo;
        private final ChatClient chatClient;
        private final ObjectMapper objectMapper;

        private static final int MAX_SUGGESTIONS = 8;
        private static final String TRENDING_KEY = "autocomplete:trending";

        @Override
        public AutocompleteResult suggest(UUID candidateId, String partial) {
                if (partial == null || partial.trim().length() < 2)
                        return AutocompleteResult.builder().suggestions(List.of()).build();

                String q = partial.trim().toLowerCase();
                List<AutocompleteResult.SuggestedQuery> results = new ArrayList<>();

                // Tầng 1: Lịch sử cá nhân — chỉ khi đã đăng nhập
                if (candidateId != null) {
                        String personalKey = "autocomplete:personal:" + candidateId;
                        Set<String> personal = redisTemplate.opsForZSet()
                                        .reverseRangeByScore(personalKey, 0, Double.MAX_VALUE, 0, 20);
                        if (personal != null) {
                                personal.stream()
                                                .filter(s -> s.startsWith(q))
                                                .limit(3)
                                                .map(s -> AutocompleteResult.SuggestedQuery.builder()
                                                                .query(s)
                                                                .type(AutocompleteResult.QueryType.RECENT)
                                                                .reason("Bạn đã tìm trước đây")
                                                                .relevanceScore(90)
                                                                .build())
                                                .forEach(results::add);
                        }
                }

                // Tầng 2: Trending toàn platform — luôn chạy
                Set<String> trending = redisTemplate.opsForZSet()
                                .reverseRangeByScore(TRENDING_KEY, 0, Double.MAX_VALUE, 0, 50);
                if (trending != null) {
                        trending.stream()
                                        .filter(s -> s.startsWith(q))
                                        .filter(s -> results.stream().noneMatch(r -> r.getQuery().equals(s)))
                                        .limit(3)
                                        .map(s -> AutocompleteResult.SuggestedQuery.builder()
                                                        .query(s)
                                                        .type(AutocompleteResult.QueryType.TRENDING)
                                                        .reason("Đang được tìm nhiều")
                                                        .relevanceScore(75)
                                                        .build())
                                        .forEach(results::add);
                }

                // Tầng 3: AI gợi ý — lịch sử cá nhân nếu đăng nhập, rỗng nếu chưa
                if (results.size() < 5) {
                        List<String> history = candidateId != null
                                        ? searchEventRepo.findRecentKeywordsByCandidate(candidateId, 10)
                                        : List.of();
                        getAiSuggestions(q, history).stream()
                                        .filter(s -> results.stream()
                                                        .noneMatch(r -> r.getQuery().equals(s.getQuery())))
                                        .limit(MAX_SUGGESTIONS - results.size())
                                        .forEach(results::add);
                }

                return AutocompleteResult.builder().suggestions(results).build();
        }

        private List<AutocompleteResult.SuggestedQuery> getAiSuggestions(
                        String partial, List<String> history) {
                try {
                        String prompt = """
                                        Candidate đang gõ: "%s"
                                        Lịch sử tìm kiếm gần đây: %s

                                        Gợi ý 3 từ khóa tìm kiếm việc làm phù hợp.
                                        Trả về JSON (không thêm text ngoài JSON):
                                        {
                                          "suggestions": [
                                            {"query": "từ khóa", "reason": "lý do ngắn"}
                                          ]
                                        }
                                        """.formatted(partial, String.join(", ", history));

                        String raw = chatClient.prompt().user(prompt).call().content();
                        String clean = raw.trim()
                                        .replaceAll("(?s)^```json\\s*", "")
                                        .replaceAll("(?s)```\\s*$", "").trim();

                        var node = objectMapper.readTree(clean).get("suggestions");
                        List<AutocompleteResult.SuggestedQuery> list = new ArrayList<>();
                        node.forEach(n -> list.add(AutocompleteResult.SuggestedQuery.builder()
                                        .query(n.get("query").asText())
                                        .reason(n.get("reason").asText())
                                        .type(AutocompleteResult.QueryType.AI_SUGGESTED)
                                        .relevanceScore(70)
                                        .build()));
                        return list;
                } catch (Exception e) {
                        log.warn("AI autocomplete failed: {}", e.getMessage());
                        return List.of();
                }
        }
}