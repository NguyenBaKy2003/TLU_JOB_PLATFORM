package edu.tlu.jobplatform.auth.infrastructure.security;

import edu.tlu.jobplatform.auth.infrastructure.oauth2.OAuth2SuccessHandler;
import edu.tlu.jobplatform.auth.infrastructure.oauth2.OAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Cấu hình Spring Security.
 *
 * Chiến lược:
 * - Stateless — JWT thay thế HttpSession
 * - CSRF disabled — không cần cho REST API stateless
 * - CORS config lấy từ shared/config/SecurityConfig (Bean
 * CorsConfigurationSource)
 * - @PreAuthorize bật để kiểm tra role từng endpoint chi tiết
 * - OAuth2 login tích hợp Google/FaceBook
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;
        private final UserDetailsServiceImpl userDetailsService;
        private final OAuth2UserService oauth2UserService;
        private final OAuth2SuccessHandler oauth2SuccessHandler;
        private final CorsConfigurationSource corsConfigurationSource;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                return http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // ── 401 / 403 custom response ──────────────────────────
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((req, res, e) -> {
                                                        res.setStatus(401);
                                                        res.setContentType("application/json;charset=UTF-8");
                                                        res.getWriter().write(
                                                                        "{\"success\":false,\"message\":\"Vui lòng đăng nhập để tiếp tục.\","
                                                                                        +
                                                                                        "\"errorCode\":\"UNAUTHORIZED\"}");
                                                })
                                                .accessDeniedHandler((req, res, e) -> {
                                                        res.setStatus(403);
                                                        res.setContentType("application/json;charset=UTF-8");
                                                        res.getWriter().write(
                                                                        "{\"success\":false,\"message\":\"Bạn không có quyền thực hiện thao tác này.\","
                                                                                        +
                                                                                        "\"errorCode\":\"FORBIDDEN\"}");
                                                }))

                                // ── Authorization rules ────────────────────────────────
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/v1/auth/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v1/jobs/**",
                                                                "/api/v1/companies/**",
                                                                "/api/v1/search/**", "/api/v1/categories/**")
                                                .permitAll()
                                                .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
                                                .requestMatchers("/login/oauth2/**").permitAll()
                                                .requestMatchers("/actuator/health").permitAll()
                                                .requestMatchers("/api/webhooks/**").permitAll() // xác thực bằng
                                                                                                 // signature riêng
                                                .requestMatchers("/api/v1/admin/**").permitAll()
                                                .anyRequest().authenticated())

                                // ── OAuth2 Login ───────────────────────────────────────
                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(ui -> ui.userService(oauth2UserService))
                                                .successHandler(oauth2SuccessHandler)
                                                .failureUrl("/api/auth/oauth2/failure"))

                                // ── JWT Filter ─────────────────────────────────────────
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                                .build();
        }

        /** BCrypt strength=12: hash ~250ms — đủ chậm để chống brute force */
        @Bean
        public BCryptPasswordEncoder bCryptPasswordEncoder() {
                return new BCryptPasswordEncoder(12);
        }

        @Bean
        public DaoAuthenticationProvider authenticationProvider() {
                var provider = new DaoAuthenticationProvider();
                provider.setUserDetailsService(userDetailsService);
                provider.setPasswordEncoder(bCryptPasswordEncoder());
                return provider;
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }
}
