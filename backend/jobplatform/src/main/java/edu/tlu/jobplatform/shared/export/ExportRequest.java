package edu.tlu.jobplatform.shared.export;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Đóng gói toàn bộ thông tin cần thiết để xuất một bảng.
 *
 * @param <T> kiểu dòng dữ liệu
 */
@Getter
@Builder
public class ExportRequest<T> {

    /** Tiêu đề sheet (Excel) hoặc tiêu đề trang (PDF) */
    private final String title;

    /** Tên file khi download — không bao gồm extension */
    private final String filename;

    /** Danh sách cột */
    private final List<ExportColumn<T>> columns;

    /** Dữ liệu cần xuất */
    private final List<T> data;

    /**
     * Tên tổ chức / phụ đề — hiển thị bên dưới title trong PDF.
     * Có thể null.
     */
    private final String subtitle;
}