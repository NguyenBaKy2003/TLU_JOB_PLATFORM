// ── UserRegisteredEvent.java ──────────────────────────────────────────
package edu.tlu.jobplatform.shared.event.user;

import java.util.UUID;

/**
 * Publish sau khi User đăng ký thành công.
 * role = "CANDIDATE" | "EMPLOYER"
 */
public record UserRegisteredEvent(UUID userId, String role) {
}