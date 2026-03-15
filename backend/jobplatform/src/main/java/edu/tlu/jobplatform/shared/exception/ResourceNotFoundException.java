package edu.tlu.jobplatform.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Entity không tìm thấy trong database — HTTP 404.
 *
 * Cách dùng:
 * <pre>
 *   repo.findById(id)
 *       .orElseThrow(() -> new ResourceNotFoundException("JobPost", id));
 *
 *   // Hoặc dùng factory method tường minh hơn:
 *   .orElseThrow(() -> ResourceNotFoundException.jobPost(id));
 * </pre>
 */
public class ResourceNotFoundException extends DomainException {

    public ResourceNotFoundException(String resourceName, Object id) {
        super(resourceName + " không tìm thấy với id: " + id,
              "RESOURCE_NOT_FOUND",
              HttpStatus.NOT_FOUND);
    }

    public ResourceNotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND);
    }

    // ── Factory methods cho từng domain ──────────────────────────

    public static ResourceNotFoundException user(Object id) {
        return new ResourceNotFoundException("User", id);
    }

    public static ResourceNotFoundException candidate(Object id) {
        return new ResourceNotFoundException("CandidateProfile", id);
    }

    public static ResourceNotFoundException company(Object id) {
        return new ResourceNotFoundException("CompanyProfile", id);
    }

    public static ResourceNotFoundException jobPost(Object id) {
        return new ResourceNotFoundException("JobPost", id);
    }

    public static ResourceNotFoundException application(Object id) {
        return new ResourceNotFoundException("Application", id);
    }

    public static ResourceNotFoundException cv(Object id) {
        return new ResourceNotFoundException("CandidateCV", id);
    }

    public static ResourceNotFoundException subscription(Object id) {
        return new ResourceNotFoundException("Subscription", id);
    }
}
