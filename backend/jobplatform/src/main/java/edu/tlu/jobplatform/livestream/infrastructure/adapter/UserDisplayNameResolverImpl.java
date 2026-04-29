package edu.tlu.jobplatform.livestream.infrastructure.adapter;

import edu.tlu.jobplatform.livestream.application.usecase.candidate.UserDisplayNameResolver;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserDisplayNameResolverImpl implements UserDisplayNameResolver {

    private final UserRepository userRepository;

    @Override
    public String resolve(UUID userId) {
        return userRepository.findById(userId)
                .map(user -> user.getFullName())
                .orElse("Unknown User");
    }
}