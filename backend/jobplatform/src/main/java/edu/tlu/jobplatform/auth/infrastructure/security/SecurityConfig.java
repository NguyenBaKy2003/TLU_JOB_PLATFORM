package edu.tlu.jobplatform.auth.infrastructure.security;

import edu.tlu.jobplatform.auth.infrastructure.oauth2.OAuth2SuccessHandler;
import edu.tlu.jobplatform.auth.infrastructure.oauth2.OAuth2UserService;
import edu.tlu.jobplatform.ratelimit.infrastructure.filter.RateLimitFilter;
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
        public SecurityFilterChain securityFilterChain(HttpSecurity http, RateLimitFilter rateLimitFilter)
                        throws Exception {
                return http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // ── 401 / 403 custom response ────────────────────────────────────────
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((req, res, e) -> {
                                                        res.setStatus(401);
                                                        res.setContentType("application/json;charset=UTF-8");
                                                        res.getWriter().write(
                                                                        "{\"success\":false,\"message\":\"Vui lòng đăng nhập để tiếp tục.\","
                                                                                        + "\"errorCode\":\"UNAUTHORIZED\"}");
                                                })
                                                .accessDeniedHandler((req, res, e) -> {
                                                        res.setStatus(403);
                                                        res.setContentType("application/json;charset=UTF-8");
                                                        res.getWriter().write(
                                                                        "{\"success\":false,\"message\":\"Bạn không có quyền thực hiện thao tác này.\","
                                                                                        + "\"errorCode\":\"FORBIDDEN\"}");
                                                }))

                                // ── Authorization rules ──────────────────────────────────────────────
                                .authorizeHttpRequests(auth -> auth

                                                // Auth
                                                .requestMatchers("/api/v1/auth/**").permitAll()
                                                // Swagger / Actuator / OAuth2 / WebSocket / Webhook
                                                .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
                                                .requestMatchers("/login/oauth2/**").permitAll()
                                                .requestMatchers("/actuator/health").permitAll()
                                                .requestMatchers("/actuator/caches/**").permitAll()
                                                .requestMatchers("/api/v1/ws/**").permitAll()
                                                .requestMatchers("/api/webhooks/**").permitAll()

                                                // Payment callback (VNPay, etc.)
                                                .requestMatchers("/api/v1/payments/callback/**").permitAll()

                                                // ── Public GET endpoints ─────────────────────────────────────
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/v1/jobs/**",
                                                                "/api/v1/companies/**",
                                                                "/api/v1/search/**",
                                                                "/api/v1/categories/**")
                                                .permitAll()

                                                // AI analytics — competition-rate public, pass-probability cần role
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/v1/job-posts/*/competition-rate")
                                                .permitAll()

                                                // Streams — cần authenticated (POST leave)
                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/v1/streams/*/leave")
                                                .authenticated()

                                                // ── Tạm thời permitAll (dọn dần về authenticated) ────────────
                                                // TODO: thu hẹp các rule này về đúng role cần thiết
                                                .requestMatchers("/api/v1/admin/**").permitAll()
                                                .requestMatchers("/api/v1/subscriptions/**").permitAll()
                                                .requestMatchers("/api/v1/candidate/**").permitAll()
                                                .requestMatchers("/api/v1/applications/**").permitAll()
                                                .requestMatchers("/api/v1/ai/**").permitAll()
                                                .requestMatchers(
                                                                "/api/v1/payments/callback/**")
                                                .permitAll()
                                                // Settings bắt buộc đăng nhập
                                                .requestMatchers("/api/v1/settings/**").authenticated()

                                                .anyRequest().authenticated())

                                // ── OAuth2 Login ────
                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(ui -> ui.userService(oauth2UserService))
                                                .successHandler(oauth2SuccessHandler)
                                                .failureUrl("/api/auth/oauth2/failure"))

                                // ── Filters: RateLimit → JWT → UsernamePassword ──────────────────────
                                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                                .addFilterBefore(jwtAuthFilter, rateLimitFilter.getClass())
                                .build();
        }

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