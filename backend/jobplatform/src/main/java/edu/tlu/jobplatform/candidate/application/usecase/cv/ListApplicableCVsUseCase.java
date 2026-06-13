package edu.tlu.jobplatform.candidate.application.usecase.cv;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

/**
 * Lấy danh sách CV candidate có thể chọn khi nộp đơn:
 * - CV uploaded: tất cả
 * - CV online: chỉ PUBLISHED
 *
 * Trả về ApplicableCV — DTO gọn, đủ để frontend render dropdown chọn CV.
 */
@Service
@RequiredArgsConstructor
public class ListApplicableCVsUseCase {

        private final CandidateCVRepository uploadedCVRepo;
        private final OnlineCVRepository onlineCVRepo;

        public List<ApplicableCV> execute(UUID candidateId) {

                List<ApplicableCV> fromUploaded = uploadedCVRepo
                                .findAllByCandidateId(candidateId)
                                .stream()
                                .map(ApplicableCV::fromUploaded)
                                .toList();

                List<ApplicableCV> fromOnline = onlineCVRepo
                                .findPublishedByCandidateId(candidateId)
                                .stream()
                                .map(ApplicableCV::fromOnline)
                                .toList();

                return Stream.concat(fromUploaded.stream(), fromOnline.stream())
                                .sorted(Comparator
                                                .comparing(ApplicableCV::isPrimary).reversed()
                                                .thenComparing(ApplicableCV::getCreatedAt,
                                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .toList();
        }

        // ── Result DTO ────────────────────────────────────────────────────────────

        @Getter
        @Builder
        public static class ApplicableCV {

                private UUID id;
                private String title;
                private String type; // "UPLOADED" | "ONLINE"
                private String fileUrl; // null nếu ONLINE
                private String slug; // null nếu UPLOADED
                private boolean primary;
                private LocalDateTime createdAt;

                static ApplicableCV fromUploaded(CandidateCV cv) {
                        return ApplicableCV.builder()
                                        .id(cv.getId())
                                        .title(cv.getTitle())
                                        .type("UPLOADED")
                                        .fileUrl(cv.getFileUrl())
                                        .primary(cv.isPrimary())
                                        .createdAt(cv.getCreatedAt())
                                        .build();
                }

                static ApplicableCV fromOnline(OnlineCV cv) {
                        return ApplicableCV.builder()
                                        .id(cv.getId())
                                        .title(cv.getTitle())
                                        .type("ONLINE")
                                        .slug(cv.getSlug())
                                        .primary(cv.isPrimary())
                                        .createdAt(cv.getCreatedAt())
                                        .build();
                }
        }
}