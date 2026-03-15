package edu.tlu.jobplatform.user.infrastructure.persistence.repository;

import edu.tlu.jobplatform.user.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/** Spring Data JPA repo — chỉ làm việc với JpaEntity, không để lộ ra ngoài domain. */
@Repository
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, UUID> {

    Optional<UserJpaEntity> findByEmail(String email);

    boolean existsByEmail(String email);
}
