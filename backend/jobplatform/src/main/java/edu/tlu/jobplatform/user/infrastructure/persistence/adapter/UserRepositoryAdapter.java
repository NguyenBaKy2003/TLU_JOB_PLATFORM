package edu.tlu.jobplatform.user.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import edu.tlu.jobplatform.user.infrastructure.persistence.entity.UserJpaEntity;
import edu.tlu.jobplatform.user.infrastructure.persistence.mapper.UserMapper;
import edu.tlu.jobplatform.user.infrastructure.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * Adapter kết nối domain UserRepository (interface) với Spring Data JPA.
 *
 * Domain UseCase chỉ biết UserRepository interface.
 * Adapter này là implementation thực tế — inject JPA repository bên trong.
 *
 * Nếu muốn đổi sang MongoDB:
 * → Viết MongoUserRepositoryAdapter implements UserRepository
 * → Thay @Primary → UseCase không cần sửa 1 dòng nào
 */
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
    public User save(User user) {
        if (user.getId() != null) {
            // UPDATE: load entity cũ, merge, save
            Optional<UserJpaEntity> existing = jpaRepo.findById(user.getId());
            if (existing.isPresent()) {
                UserJpaEntity entity = existing.get();
                mapper.updateEntity(entity, user);
                return mapper.toDomain(jpaRepo.save(entity));
            }
        }
        // INSERT: tạo entity mới
        UserJpaEntity newEntity = mapper.toNewEntity(user);
        return mapper.toDomain(jpaRepo.save(newEntity));
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }
}
