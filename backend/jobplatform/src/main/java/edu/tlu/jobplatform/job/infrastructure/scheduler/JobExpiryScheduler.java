// package edu.tlu.jobplatform.job.infrastructure.scheduler;

// import edu.tlu.jobplatform.job.domain.model.JobPost;
// import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
// import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
// import edu.tlu.jobplatform.job.domain.service.JobPostDomainService;
// import edu.tlu.jobplatform.job.infrastructure.event.JobEventPublisher;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Component;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.LocalDateTime;
// import java.util.List;

// /**
// * Scheduler: Tự động expire tin tuyển dụng hết hạn.
// *
// * Chạy mỗi giờ — tìm tất cả PUBLISHED job có deadline đã qua,
// * chuyển sang EXPIRED và publish event.
// *
// * Cần thêm @EnableScheduling vào Application class hoặc Config class.
// */
// @Slf4j
// @Component
// @RequiredArgsConstructor
// public class JobExpiryScheduler {

// private final JobPostRepository jobPostRepository;
// private final JobPostDomainService domainService;
// private final JobEventPublisher eventPublisher;

// /**
// * Chạy mỗi giờ vào phút thứ 0.
// * Cron: "0 0 * * * *" = đầu mỗi giờ
// *
// * Tuỳ chỉnh trong application.yml:
// * job.scheduler.expiry-cron=0 0 * * * *
// */
// @Scheduled(cron = "${job.scheduler.expiry-cron:0 0 * * * *}")
// @Transactional
// public void expireOverdueJobs() {
// LocalDateTime now = LocalDateTime.now();
// List<JobPost> overdueJobs = jobPostRepository
// .findByStatusAndDeadlineBefore(JobStatus.PUBLISHED, now);

// if (overdueJobs.isEmpty()) {
// log.debug("No overdue jobs found at {}", now);
// return;
// }

// log.info("Expiring {} overdue job posts...", overdueJobs.size());

// int expired = 0;
// for (JobPost job : overdueJobs) {
// try {
// domainService.expire(job);
// jobPostRepository.save(job);
// eventPublisher.publishJobExpired(job);
// expired++;
// } catch (Exception e) {
// log.error("Failed to expire job id={}: {}", job.getId(), e.getMessage());
// }
// }

// log.info("Expired {}/{} job posts.", expired, overdueJobs.size());
// }
// }