package edu.tlu.jobplatform.user.infrastructure.persistence.repository;

import edu.tlu.jobplatform.user.domain.model.UserRole;
import edu.tlu.jobplatform.user.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, UUID> {

        Optional<UserJpaEntity> findByEmail(String email);

        boolean existsByEmail(String email);

        Page<UserJpaEntity> findByRole(UserRole role, Pageable pageable);

        @Query("""
                        SELECT u FROM UserJpaEntity u
                        WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(u.email)    LIKE LOWER(CONCAT('%', :keyword, '%'))
                        """)
        Page<UserJpaEntity> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

        @Query("""
                        SELECT u FROM UserJpaEntity u
                        WHERE (:keyword IS NULL
                               OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                               OR LOWER(u.email)    LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
                          AND (:role     IS NULL OR u.role     = :role)
                          AND (:isActive IS NULL OR u.isActive = :isActive)
                        """)
        Page<UserJpaEntity> searchUsers(
                        @Param("keyword") String keyword,
                        @Param("role") UserRole role,
                        @Param("isActive") Boolean isActive,
                        Pageable pageable);
}