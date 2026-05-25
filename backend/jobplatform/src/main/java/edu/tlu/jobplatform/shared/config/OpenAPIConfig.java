package edu.tlu.jobplatform.shared.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình Swagger / OpenAPI.
 *
 * Truy cập tại: http://localhost:8080/swagger-ui.html
 *
 * Thêm nút "Authorize" để test JWT token trực tiếp trên Swagger UI.
 * Nhập: Bearer {your_token} sau khi đăng nhập.
 */
@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CareerUp API — TLU")
                        .description("""
                                Hệ thống tuyển dụng AI-Powered

                                ## Xác thực
                                1. Gọi `POST /api/auth/login` để lấy access token
                                2. Click nút **Authorize** (🔒) ở góc phải
                                3. Nhập: `Bearer {access_token}`

                                ## Roles
                                | Role | Mô tả |
                                |---|---|
                                | CANDIDATE | Ứng viên tìm việc |
                                | EMPLOYER  | Nhà tuyển dụng đăng bài |
                                | ADMIN     | Quản trị viên |
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("TLU Dev Team")
                                .email("dev@tlu.edu.vn")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Nhập JWT access token (không cần prefix 'Bearer')")));
    }
}
