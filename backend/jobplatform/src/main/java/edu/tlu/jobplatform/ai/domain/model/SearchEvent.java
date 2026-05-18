package edu.tlu.jobplatform.ai.domain.model;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class SearchEvent {

    public enum EventType {
        SEARCH_QUERY, // gõ từ khóa tìm kiếm
        JOB_VIEW, // xem chi tiết job
        JOB_SAVE, // lưu job
        JOB_APPLY, // apply job
        JOB_SKIP, // scroll qua nhanh (< 5s)
        COMPANY_VIEW // xem trang công ty
    }

    private final UUID id;
    private final UUID candidateId;
    private final EventType eventType;
    private final String keyword; // dùng khi SEARCH_QUERY
    private final UUID jobPostId; // dùng khi JOB_VIEW/SAVE/APPLY/SKIP
    private final UUID companyId; // dùng khi COMPANY_VIEW
    private final int dwellSeconds; // thời gian xem (giây)
    private final LocalDateTime occurredAt;
}