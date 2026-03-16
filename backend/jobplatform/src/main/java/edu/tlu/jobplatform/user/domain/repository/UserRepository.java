package edu.tlu.jobplatform.user.domain.repository;

import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository {

    Optional<User> findById(UUID id);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    User save(User user);

    void deleteById(UUID id);

    // ── Admin search ──────────────────────────────────────────────
    Page<User> searchUsers(String keyword, UserRole role, Boolean active, Pageable pageable);
}