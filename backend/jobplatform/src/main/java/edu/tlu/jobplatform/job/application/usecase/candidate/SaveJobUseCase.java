package edu.tlu.jobplatform.job.application.usecase.candidate;

import edu.tlu.jobplatform.job.domain.model.SavedJob;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.domain.repository.SavedJobRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

// ── SaveJobUseCase ────────────────────────────────────────────────

@Slf4j
@Service
@RequiredArgsConstructor
public class SaveJobUseCase {

    private final SavedJobRepository savedJobRepository;
    private final JobPostRepository jobPostRepository;

    /** Lưu bài đăng yêu thích — toggle nếu đã lưu thì bỏ */
    @Transactional
    public boolean toggle(UUID candidateId, UUID jobPostId) {

        // Kiểm tra bài đăng tồn tại
        jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        if (savedJobRepository.existsByCandidateIdAndJobPostId(candidateId, jobPostId)) {
            savedJobRepository.deleteByCandidateIdAndJobPostId(candidateId, jobPostId);
            return false; // đã bỏ lưu
        }

        savedJobRepository.save(SavedJob.builder()
                .id(UUID.randomUUID())
                .candidateId(candidateId)
                .jobPostId(jobPostId)
                .savedAt(LocalDateTime.now())
                .build());
        return true; // đã lưu
    }
}
