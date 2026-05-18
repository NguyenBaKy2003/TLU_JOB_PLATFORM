package edu.tlu.jobplatform.ai.domain.model;

import lombok.*;

import java.util.List;

@Getter
@Builder
public class AutocompleteResult {

    @Getter
    @Builder
    public static class SuggestedQuery {
        private final String query;
        private final String reason; // "Bạn đã tìm Java 5 lần"
        private final int relevanceScore; // 0-100
        private final QueryType type;
    }

    public enum QueryType {
        RECENT, // từ lịch sử tìm kiếm
        TRENDING, // đang hot trên platform
        AI_SUGGESTED // AI suy luận từ hành vi
    }

    private final List<SuggestedQuery> suggestions; // tối đa 8 gợi ý
}
