package edu.tlu.jobplatform.user.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import edu.tlu.jobplatform.user.infrastructure.persistence.entity.UserJpaEntity;
import edu.tlu.jobplatform.user.infrastructure.persistence.mapper.UserMapper;
import edu.tlu.jobplatform.user.infrastructure.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepository {

    private final UserJpaRepository jpaRepo;
    private final UserMapper mapper;

    @Override
    public Optional<User> findById(UUID id) {
        return jpaRepo.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaRepo.findByEmail(email).map(mapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepo.existsByEmail(email);
    }

    @Override
    public boolean existsById(UUID id) {
        return jpaRepo.existsById(id);
    }

    @Override
    public User save(User user) {
        if (user.getId() != null) {
            Optional<UserJpaEntity> existing = jpaRepo.findById(user.getId());
            if (existing.isPresent()) {
                UserJpaEntity entity = existing.get();
                mapper.updateEntity(entity, user);
                return mapper.toDomain(jpaRepo.save(entity));
            }
        }
        return mapper.toDomain(jpaRepo.save(mapper.toNewEntity(user)));
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }

    @Override
    public long countAll() {
        return jpaRepo.count();
    }

    @Override
    public Page<User> findAll(Pageable pageable) {
        return jpaRepo.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<User> findByRole(UserRole role, Pageable pageable) {
        return jpaRepo.findByRole(role, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<User> searchByKeyword(String keyword, Pageable pageable) {
        return jpaRepo.searchByKeyword(keyword, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<User> searchUsers(String keyword, UserRole role, Boolean active, Pageable pageable) {
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        return jpaRepo.searchUsers(kw, role, active, pageable).map(mapper::toDomain);
    }
}