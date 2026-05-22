// ── CompanyProfileCreatedEvent.java ──────────────────────────────────
package edu.tlu.jobplatform.shared.event.company;

import java.util.UUID;

/**
 * Publish sau khi Company profile được tạo lần đầu.
 * Dùng để trigger assign Free plan cho Company.
 */
public record CompanyProfileCreatedEvent(UUID companyId, UUID ownerId) {
}