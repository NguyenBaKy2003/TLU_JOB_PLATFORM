package edu.tlu.jobplatform.user.domain.repository;

import java.util.Optional;
import java.util.UUID;

import edu.tlu.jobplatform.user.domain.model.User;

/**
 * Port (interface) để truy cập user data.
 *
 * Domain định nghĩa interface này — không biết implement thế nào.
 * Infrastructure layer (UserRepositoryAdapter) sẽ implement bằng JPA.
 *
 * Quy tắc: chỉ dùng domain model (User), không dùng JPA entity.
 */

public interface UserRepository {

    Optional<User> findById(UUID id);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    User save(User user);

    void deleteById(UUID id);
}