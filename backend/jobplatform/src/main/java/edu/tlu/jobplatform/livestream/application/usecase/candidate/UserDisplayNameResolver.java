// livestream/application/usecase/candidate/UserDisplayNameResolver.java
package edu.tlu.jobplatform.livestream.application.usecase.candidate;

import java.util.UUID;

/**
 * Port nội bộ: lấy tên hiển thị của user.
 * Adapter implement bằng cách gọi UserRepository từ user domain.
 */
public interface UserDisplayNameResolver {
    String resolve(UUID userId);
}