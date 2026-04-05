package edu.tlu.jobplatform.websocket.infrastructure.config;

import edu.tlu.jobplatform.auth.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || accessor.getCommand() != StompCommand.CONNECT) {
            return message;
        }

        String token = extractToken(accessor);
        if (token == null || !jwtTokenProvider.validateToken(token)) {
            log.warn("WS CONNECT rejected: invalid or missing JWT");
            throw new IllegalArgumentException("Invalid JWT token");
        }

        String userId = jwtTokenProvider.extractUserId(token).toString();
        String role = jwtTokenProvider.extractRole(token);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userId, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role)));
        accessor.setUser(auth);
        log.debug("WS CONNECT authenticated: userId={}", userId);

        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        // Client gửi: CONNECT headers: { Authorization: "Bearer <token>" }
        String auth = accessor.getFirstNativeHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            return auth.substring(7);
        }
        return null;
    }
}