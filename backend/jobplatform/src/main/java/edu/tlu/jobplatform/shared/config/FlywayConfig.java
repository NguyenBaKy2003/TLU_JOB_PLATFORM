package edu.tlu.jobplatform.shared.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * Cấu hình Flyway — quản lý migration database.
 *
 * Flyway = "Git cho database":
 *   - Mỗi thay đổi schema → 1 file SQL có version
 *   - Không bao giờ sửa file migration cũ
 *   - Tất cả thành viên team chạy cùng migration
 *
 * File migration đặt tại: src/main/resources/db/migration/
 * Quy ước đặt tên: V{version}__{mô_tả}.sql
 *   V1__create_shared_tables.sql
 *   V2__create_user_auth_tables.sql
 *   V3__create_candidate_tables.sql
 *
 * Config từ application.yml:
 *   spring.flyway.enabled: true
 *   spring.flyway.locations: classpath:db/migration
 *   spring.flyway.baseline-on-migrate: true   ← cho DB đã có sẵn
 *   spring.flyway.validate-on-migrate: true   ← phát hiện file bị sửa
 *   spring.flyway.out-of-order: false         ← không cho chạy lộn thứ tự
 *
 * CẢNH BÁO: spring.jpa.hibernate.ddl-auto PHẢI là "validate" hoặc "none".
 * KHÔNG dùng "create", "create-drop", "update" — Flyway quản lý schema.
 */
@Configuration
@EnableConfigurationProperties(FlywayProperties.class)
public class FlywayConfig {

    /**
     * Bean Flyway tường minh — cho phép customize nếu cần.
     * Trong hầu hết trường hợp, Spring Boot auto-config là đủ.
     * Class này chủ yếu để documentation.
     */
    @Bean
    public Flyway flyway(DataSource dataSource, FlywayProperties properties) {
        return Flyway.configure()
            .dataSource(dataSource)
            .locations(properties.getLocations().toArray(new String[0]))
            .baselineOnMigrate(properties.isBaselineOnMigrate())
            .validateOnMigrate(properties.isValidateOnMigrate())
            .outOfOrder(properties.isOutOfOrder())
            .load();
    }
}
