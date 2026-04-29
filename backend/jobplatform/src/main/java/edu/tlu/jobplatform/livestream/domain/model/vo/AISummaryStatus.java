package edu.tlu.jobplatform.livestream.domain.model.vo;

public enum AISummaryStatus {
    PENDING, // Chờ xử lý
    PROCESSING, // Đang transcribe + summarize
    DONE, // Hoàn tất
    FAILED // Lỗi (có thể retry)
}