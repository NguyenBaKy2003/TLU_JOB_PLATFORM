package edu.tlu.jobplatform.application.usecase.port.out;

import edu.tlu.jobplatform.application.domain.model.vo.AIScore;

import java.util.UUID;

public interface AIScorePort {

    /**
     * Tính điểm phù hợp giữa CV của ứng viên và JD.
     *
     * @param applicationId ID đơn ứng tuyển
     * @param cvUrl         URL file CV
     * @param jobFullText   Full text JD (title + description + requirements)
     * @return AIScore hoặc null nếu lỗi
     */
    AIScore calculateScore(UUID applicationId, String cvUrl, String jobFullText);
}