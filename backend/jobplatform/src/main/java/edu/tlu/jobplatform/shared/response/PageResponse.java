package edu.tlu.jobplatform.shared.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Wrapper cho response có phân trang.
 *
 * Dùng khi trả về danh sách có phân trang:
 * <pre>
 * {
 *   "content"      : [ {...}, {...} ],
 *   "page"         : 0,
 *   "size"         : 20,
 *   "totalElements": 150,
 *   "totalPages"   : 8,
 *   "first"        : true,
 *   "last"         : false,
 *   "empty"        : false
 * }
 * </pre>
 */
@Getter
@Schema(description = "Response có phân trang")
public class PageResponse<T> {

    private final List<T> content;
    private final int     page;
    private final int     size;
    private final long    totalElements;
    private final int     totalPages;
    private final boolean first;
    private final boolean last;
    private final boolean empty;

    private PageResponse(List<T> content, int page, int size,
                         long totalElements, int totalPages,
                         boolean first, boolean last) {
        this.content       = content;
        this.page          = page;
        this.size          = size;
        this.totalElements = totalElements;
        this.totalPages    = totalPages;
        this.first         = first;
        this.last          = last;
        this.empty         = content == null || content.isEmpty();
    }

    /**
     * Tạo từ Spring Data Page — cách dùng phổ biến nhất.
     * <pre>
     *   Page&lt;Job&gt; page = repo.findAll(pageable);
     *   return PageResponse.from(page.map(mapper::toDto));
     * </pre>
     */
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast()
        );
    }

    /**
     * Tạo thủ công — dùng cho Elasticsearch hoặc custom queries.
     */
    public static <T> PageResponse<T> of(List<T> content, int page, int size, long total) {
        int totalPages = size == 0 ? 1 : (int) Math.ceil((double) total / size);
        return new PageResponse<>(
            content, page, size, total, totalPages,
            page == 0,
            page >= totalPages - 1
        );
    }
}
