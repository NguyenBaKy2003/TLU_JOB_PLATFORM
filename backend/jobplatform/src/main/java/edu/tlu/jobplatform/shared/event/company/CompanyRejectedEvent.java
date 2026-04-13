package edu.tlu.jobplatform.shared.event.company;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Admin từ chối xác minh công ty.
 *
 * Consumers:
 * - Notification domain → email thông báo lý do từ chối
 */
@Getter
public class CompanyRejectedEvent extends DomainEvent {

        private final UUID companyId;
        private final String companyName;
        private final String companyEmail;
        private final UUID ownerId;
        private final String reason;

        public CompanyRejectedEvent(UUID companyId, String companyName,
                        String companyEmail, UUID ownerId, String reason) {
                super();
                this.companyId = companyId;
                this.companyName = companyName;
                this.companyEmail = companyEmail;
                this.ownerId = ownerId;
                this.reason = reason;
        }
}