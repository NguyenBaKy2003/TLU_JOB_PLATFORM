package edu.tlu.jobplatform.shared.config;

import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import edu.tlu.jobplatform.shared.security.SecurityUtils;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
class JpaAuditingConfig {

    /**
     * Cung cấp userId của user hiện tại cho JPA Auditing.
     * Được dùng để set createdBy và updatedBy.
     */
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> SecurityUtils.getCurrentUserId()
                .map(Object::toString)
                .or(() -> Optional.of("system"));
    }
}