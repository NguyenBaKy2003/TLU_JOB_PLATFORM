package edu.tlu.jobplatform.user.application.usecase;

import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.user.application.dto.AdminUserQuery;
import edu.tlu.jobplatform.user.application.dto.AdminUserSummary;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class SearchUsersUseCase {

    private static final int MAX_PAGE_SIZE = 100;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "createdAt", "lastLoginAt", "fullName", "email", "role");

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<AdminUserSummary> execute(AdminUserQuery q) {
        Pageable pageable = buildPageable(q);

        return PageResponse.from(
                userRepository
                        .searchUsers(q.getKeyword(), q.getRole(), q.getActive(), pageable)
                        .map(AdminUserSummary::from));
    }

    private Pageable buildPageable(AdminUserQuery q) {
        int size = Math.min(Math.max(q.getSize(), 1), MAX_PAGE_SIZE);
        int page = Math.max(q.getPage(), 0);
        String sortBy = ALLOWED_SORT_FIELDS.contains(q.getSortBy())
                ? q.getSortBy()
                : "createdAt";
        Sort.Direction dir = "asc".equalsIgnoreCase(q.getSortDir())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return PageRequest.of(page, size, Sort.by(dir, sortBy));
    }
}