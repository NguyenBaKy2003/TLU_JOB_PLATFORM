package edu.tlu.jobplatform.auth.infrastructure.security;

import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implement UserDetailsService — Spring Security dùng để load user.
 *
 * Trong kiến trúc JWT stateless, class này chủ yếu phục vụ:
 *   - DaoAuthenticationProvider (inject vào SecurityConfig)
 *   - OAuth2 flow (Spring Security cần biết user hiện có chưa)
 *
 * Login thông thường không đi qua đây — LoginUseCase tự xử lý.
 *
 * Lưu ý: username trong Spring Security context = userId (UUID string),
 * KHÔNG phải email. SecurityUtils.getCurrentUserId() dùng auth.getName().
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException(
                "User không tồn tại: " + email));

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getId().toString())          // username = userId
            .password(user.getPasswordHash() != null ? user.getPasswordHash() : "")
            .authorities(List.of(new SimpleGrantedAuthority(user.getRole().toAuthority())))
            .accountLocked(!user.isActive())
            .disabled(!user.isActive())
            .build();
    }
}
