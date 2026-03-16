package edu.tlu.jobplatform.shared.security;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.NonNull;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.UUID;

/**
 * Resolver cho annotation @CurrentUser.
 * Tự động extract UUID từ SecurityContext và inject vào parameter.
 *
 * Đăng ký trong WebMvcConfig.addArgumentResolvers().
 */
@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
                && parameter.getParameterType().equals(UUID.class);
    }

    @Override
    public Object resolveArgument(
            @NonNull MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            @NonNull NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()
                || "anonymousUser".equals(auth.getPrincipal())) {
            throw new BusinessRuleException(
                    "Vui lòng đăng nhập để tiếp tục.", "UNAUTHORIZED");
        }

        try {
            return UUID.fromString(auth.getName());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException(
                    "Phiên đăng nhập không hợp lệ.", "INVALID_TOKEN");
        }
    }
}