package edu.tlu.jobplatform.shared.event;

import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Base class cho tất cả Domain Events trong hệ thống.
 *
 * Domain Event = thông điệp bất biến ghi lại "điều gì đó đã xảy ra".
 * Event chỉ là data object — không chứa business logic.
 *
 * Quy ước đặt tên: {Danh từ}{Động từ quá khứ}Event
 *   ✅ ApplicationSubmittedEvent
 *   ✅ JobPublishedEvent
 *   ❌ SubmitApplicationEvent  (command, không phải event)
 *
 * Cách fire event:
 * <pre>
 *   applicationEventPublisher.publishEvent(new JobPublishedEvent(...));
 * </pre>
 *
 * Cách listen event:
 * <pre>
 *   {@literal @}EventListener
 *   {@literal @}Async
 *   public void on(JobPublishedEvent event) { ... }
 * </pre>
 */
@Getter
public abstract class DomainEvent {

    /** ID duy nhất của event — dùng để deduplicate nếu fire 2 lần */
    private final String        eventId;

    /** Thời điểm event xảy ra */
    private final LocalDateTime occurredAt;

    /**
     * Correlation ID — trace chuỗi xử lý từ 1 request gốc.
     * Ví dụ: 1 request submit application → fire 3 events,
     * tất cả 3 cùng correlationId = requestId gốc.
     */
    private final String        correlationId;

    /** ID của user thực hiện action. Null nếu là system action. */
    private final String        actorId;

    protected DomainEvent(String correlationId, String actorId) {
        this.eventId       = UUID.randomUUID().toString();
        this.occurredAt    = LocalDateTime.now();
        this.correlationId = correlationId;
        this.actorId       = actorId;
    }

    protected DomainEvent() {
        this(null, null);
    }
}
