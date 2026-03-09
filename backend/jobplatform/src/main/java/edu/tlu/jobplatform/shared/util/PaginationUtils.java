package edu.tlu.jobplatform.shared.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Helper tạo Pageable từ query params với validation an toàn.
 *
 * Tại sao cần class này?
 * Nếu client truyền size=99999 → OOM.
 * PaginationUtils tự động giới hạn size tối đa về MAX_SIZE.
 */
public final class PaginationUtils {

    public static final int DEFAULT_PAGE = 0;
    public static final int DEFAULT_SIZE = 20;
    public static final int MAX_SIZE     = 100;

    private PaginationUtils() {}

    /**
     * Tạo Pageable với sort.
     *
     * @param page    trang (bắt đầu từ 0)
     * @param size    số phần tử/trang (tối đa MAX_SIZE)
     * @param sortBy  tên field sort (null = không sort)
     * @param sortDir "asc" hoặc "desc"
     */
    public static Pageable of(int page, int size, String sortBy, String sortDir) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_SIZE);

        if (sortBy == null || sortBy.isBlank()) {
            return PageRequest.of(safePage, safeSize);
        }

        Sort sort = "desc".equalsIgnoreCase(sortDir)
            ? Sort.by(sortBy).descending()
            : Sort.by(sortBy).ascending();

        return PageRequest.of(safePage, safeSize, sort);
    }

    /** Không có sort */
    public static Pageable of(int page, int size) {
        return of(page, size, null, null);
    }

    /** Sort mặc định: createdAt giảm dần (mới nhất đầu tiên) */
    public static Pageable ofNewest(int page, int size) {
        return of(page, size, "createdAt", "desc");
    }
}
