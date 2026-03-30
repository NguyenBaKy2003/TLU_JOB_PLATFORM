package edu.tlu.jobplatform.ratelimit.infrastructure.filter;

import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.domain.service.RateLimitDomainService;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.io.IOException;
import java.security.Principal;
import java.util.Map;

@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final RequestMappingHandlerMapping handlerMapping;
    private final RateLimitDomainService rateLimitService;
    private final Map<String, RateLimitPolicy> rateLimitPolicies;

    public RateLimitFilter(
            RequestMappingHandlerMapping handlerMapping,
            RateLimitDomainService rateLimitService,
            Map<String, RateLimitPolicy> rateLimitPolicies) {
        this.handlerMapping = handlerMapping;
        this.rateLimitService = rateLimitService;
        this.rateLimitPolicies = rateLimitPolicies;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        RateLimit annotation = resolveAnnotation(request);
        if (annotation == null) {
            chain.doFilter(request, response);
            return;
        }

        RateLimitPolicy policy = rateLimitPolicies.get(annotation.policy());
        if (policy == null) {
            log.warn("RateLimit policy '{}' not configured — skipping", annotation.policy());
            chain.doFilter(request, response);
            return;
        }

        String key = buildKey(annotation, policy, request);
        RateLimitDomainService.Result result = rateLimitService.check(key, policy);

        setRateLimitHeaders(response, result);

        if (!result.allowed()) {
            rejectRequest(response, annotation.policy(), key, result);
            return;
        }

        chain.doFilter(request, response);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private RateLimit resolveAnnotation(HttpServletRequest request) {
        try {
            var chain = handlerMapping.getHandler(request);
            if (chain == null)
                return null;
            if (!(chain.getHandler() instanceof HandlerMethod method))
                return null;
            return method.getMethodAnnotation(RateLimit.class);
        } catch (Exception e) {
            return null;
        }
    }

    private String buildKey(RateLimit annotation, RateLimitPolicy policy,
            HttpServletRequest request) {
        String identifier = switch (policy.getScope()) {
            case USER -> {
                Principal principal = request.getUserPrincipal();
                yield principal != null ? principal.getName() : getClientIp(request);
            }
            case IP -> getClientIp(request);
        };
        return annotation.policy() + ":" + identifier;
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void setRateLimitHeaders(HttpServletResponse response,
            RateLimitDomainService.Result result) {
        response.setHeader("X-RateLimit-Limit", String.valueOf(result.limit()));
        response.setHeader("X-RateLimit-Remaining",
                String.valueOf(Math.max(0, result.limit() - result.currentCount())));
    }

    private void rejectRequest(HttpServletResponse response, String policyName,
            String key, RateLimitDomainService.Result result) throws IOException {
        long retryAfter = result.retryAfter().getSeconds();
        response.setHeader("Retry-After", String.valueOf(retryAfter));
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8");
        response.getWriter().write("""
                {"success":false,"code":"RATE_LIMIT_EXCEEDED",\
                "message":"Quá nhiều yêu cầu. Vui lòng thử lại sau %d giây."}
                """.formatted(retryAfter));
        log.warn("Rate limit exceeded: policy={} key={} count={}", policyName, key, result.currentCount());
    }
}