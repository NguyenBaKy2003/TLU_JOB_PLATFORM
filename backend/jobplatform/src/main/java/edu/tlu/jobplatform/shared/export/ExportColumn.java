package edu.tlu.jobplatform.shared.export;

import lombok.Builder;
import lombok.Getter;

import java.util.function.Function;

/**
 * Mô tả một cột trong bảng xuất.
 *
 * @param <T> kiểu dữ liệu của một dòng
 */
@Getter
@Builder
public class ExportColumn<T> {

    /** Tiêu đề cột (header) */
    private final String header;

    /** Hàm lấy giá trị từ dòng dữ liệu */
    private final Function<T, Object> valueExtractor;

    /** Độ rộng cột tính bằng ký tự (Excel), null = auto */
    private final Integer width;

    /** Tạo cột nhanh */
    public static <T> ExportColumn<T> of(String header, Function<T, Object> extractor) {
        return ExportColumn.<T>builder()
                .header(header)
                .valueExtractor(extractor)
                .build();
    }

    public static <T> ExportColumn<T> of(String header, Function<T, Object> extractor, int width) {
        return ExportColumn.<T>builder()
                .header(header)
                .valueExtractor(extractor)
                .width(width)
                .build();
    }
}