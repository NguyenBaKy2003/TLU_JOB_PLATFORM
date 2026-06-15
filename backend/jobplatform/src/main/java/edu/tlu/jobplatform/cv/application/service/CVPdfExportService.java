package edu.tlu.jobplatform.cv.application.service;

import edu.tlu.jobplatform.cv.application.port.out.CVRenderPort;
import edu.tlu.jobplatform.cv.application.port.out.CVStoragePort;
import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Orchestrate: OnlineCV → render PDF → upload S3 → trả về URL.
 *
 * Không gọi cvRepository.save() ở đây — caller (PublishCVUseCase) tự save
 * sau khi gọi cv.updateExportedPdfUrl(url).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CVPdfExportService {

    private final CVRenderPort cvRenderPort;
    private final CVStoragePort cvStoragePort;
    private final CVTemplateRepository templateRepository;

    /**
     * Render CV thành PDF và upload lên S3.
     *
     * @return S3 URL của file PDF
     * @throws BusinessRuleException nếu template không tồn tại hoặc render thất bại
     */
    public String exportAndUpload(OnlineCV cv) {
        CVTemplate template = templateRepository.findById(cv.getTemplateId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Template không tồn tại: " + cv.getTemplateId(), "TEMPLATE_NOT_FOUND"));

        log.info("Exporting CV to PDF: cvId={} templateId={}", cv.getId(), template.getId());

        byte[] pdfBytes = cvRenderPort.render(cv, template);

        String pdfUrl = cvStoragePort.store(cv.getCandidateId(), cv.getId(), pdfBytes);

        log.info("CV PDF exported: cvId={} size={}KB url={}",
                cv.getId(), pdfBytes.length / 1024, pdfUrl);

        return pdfUrl;
    }
}