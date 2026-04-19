package edu.tlu.jobplatform.payment.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.Locale;

@Getter
@Builder
public class PaymentStatsResponse {

    private final BigDecimal    totalRevenue;
    private final String        totalRevenueFormatted;
    private final long          totalTransactions;
    private final long          pendingCount;
    private final long          successCount;
    private final long          failedCount;
    private final LocalDateTime from;
    private final LocalDateTime to;

    public static PaymentStatsResponse of(BigDecimal revenue,
                                          long total, long pending,
                                          long success, long failed,
                                          LocalDateTime from, LocalDateTime to) {
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        return PaymentStatsResponse.builder()
            .totalRevenue(revenue)
            .totalRevenueFormatted(nf.format(revenue) + " VND")
            .totalTransactions(total)
            .pendingCount(pending)
            .successCount(success)
            .failedCount(failed)
            .from(from)
            .to(to)
            .build();
    }
}
