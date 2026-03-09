package edu.tlu.jobplatform.shared.event.company;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Admin đã xác minh công ty thành công.
 *
 * Consumers:
 *   - Notification domain → email chúc mừng, hướng dẫn bước tiếp theo
 */
@Getter
public class CompanyVerifiedEvent extends DomainEvent {

    private final UUID   companyId;
    private final String companyName;
    private final String companyEmail;

    public CompanyVerifiedEvent(UUID companyId, String companyName, String companyEmail) {
        super();
        this.companyId    = companyId;
        this.companyName  = companyName;
        this.companyEmail = companyEmail;
    }
}
