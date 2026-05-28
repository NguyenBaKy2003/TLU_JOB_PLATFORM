package edu.tlu.jobplatform.application.usecase.candidate;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetMyApplicationsUseCase {

    private final ApplicationRepository applicationRepo;

    /** Response gộp page + thống kê trạng thái */
    public record Result(
            Page<Application> applications,
            Map<ApplicationStatus, Long> statusCounts) {
    }

    /**
     * Tìm kiếm đa điều kiện đơn ứng tuyển của ứng viên.
     *
     * @param candidateId ID ứng viên (lấy từ SecurityContext)
     * @param status      null → lấy tất cả trạng thái
     * @param keyword     null/blank → không lọc text; so khớp job title, company
     *                    name
     * @param pageable    phân trang + sắp xếp
     */
    @Transactional(readOnly = true)
    public Result execute(UUID candidateId,
            ApplicationStatus status,
            String keyword,
            LocalDateTime appliedAtFrom,
            LocalDateTime appliedAtTo,
            Pageable pageable) {

        boolean noFilter = status == null
                && isBlank(keyword)
                && appliedAtFrom == null
                && appliedAtTo == null;

        Page<Application> page = noFilter
                ? applicationRepo.findByCandidateId(candidateId, pageable) // fast path
                : applicationRepo.searchByCandidateId(
                        candidateId, status, keyword,
                        appliedAtFrom, appliedAtTo, pageable);

        Map<ApplicationStatus, Long> counts = applicationRepo.countByStatusForCandidate(candidateId);

        return new Result(page, counts);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}