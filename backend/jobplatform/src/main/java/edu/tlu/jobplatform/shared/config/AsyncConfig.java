package edu.tlu.jobplatform.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Cấu hình thread pool cho @Async.
 *
 * Có 2 executor:
 *   taskExecutor   — dùng Java 21 Virtual Threads, tốt cho I/O-bound (email, webhook...)
 *   aiTaskExecutor — thread pool giới hạn, tránh overwhelm OpenAI API rate limit
 */
@EnableAsync
@Configuration
public class AsyncConfig {

    /**
     * Executor mặc định cho @Async không chỉ định tên.
     * Virtual Threads — tốt cho tác vụ I/O-bound: gọi API, gửi email, Redis...
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        return java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor();
    }

    /**
     * Executor riêng cho AI tasks — tốn CPU và bị rate limit bởi OpenAI.
     * Giới hạn tối đa 5 concurrent calls.
     *
     * Dùng: @Async("aiTaskExecutor")
     */
    @Bean(name = "aiTaskExecutor")
    public Executor aiTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("ai-");
        // CallerRunsPolicy: nếu queue đầy, thread gọi tự thực thi (không drop task)
        executor.setRejectedExecutionHandler(
            new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
