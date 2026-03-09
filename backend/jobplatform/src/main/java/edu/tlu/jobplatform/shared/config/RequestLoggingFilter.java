package edu.tlu.jobplatform.shared.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter chạy đầu tiên mọi HTTP request.
 *
 * Chức năng:
 *   1. Tạo traceId duy nhất cho từng request
 *   2. Đưa traceId vào MDC → xuất hiện trong mọi log line của request đó
 *   3. Thêm X-Trace-Id vào response header
 *   4. Log request vào/ra với thời gian xử lý
 *
 * Nhờ traceId, khi debug chỉ cần grep 1 ID là thấy toàn bộ log của request đó.
 */
@Slf4j
@Component
@Order(1)
public class RequestLoggingFilter implements Filter {

    private static final String TRACE_HEADER = "X-Trace-Id";

    @Override
    public void doFilter(ServletRequest req, ServletResponse res,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest  request  = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // Dùng traceId từ upstream nếu có, tạo mới nếu không
        String traceId = request.getHeader(TRACE_HEADER);
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        }

        MDC.put("traceId", traceId);
        response.setHeader(TRACE_HEADER, traceId);

        long start = System.currentTimeMillis();
        try {
            log.debug("→ {} {}", request.getMethod(), request.getRequestURI());
            chain.doFilter(request, response);
            log.debug("← {} {}ms", response.getStatus(),
                System.currentTimeMillis() - start);
        } finally {
            // Bắt buộc clear — thread pool tái dụng thread, MDC bị giữ lại nếu không clear
            MDC.clear();
        }
    }
}
