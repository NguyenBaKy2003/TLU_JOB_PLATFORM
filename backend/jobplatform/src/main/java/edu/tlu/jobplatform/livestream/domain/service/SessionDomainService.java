package edu.tlu.jobplatform.livestream.domain.service;

import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.vo.SessionStatus;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class SessionDomainService {

    /**
     * Chỉ kiểm tra host — dùng cho các trường hợp idempotent (re-join LIVE
     * session).
     */
    public void validateIsHost(LiveStreamSession session, UUID requestingUserId) {
        if (!session.isHostedBy(requestingUserId)) {
            throw new BusinessRuleException(
                    "Chỉ host mới có thể thực hiện thao tác này",
                    "STREAM_FORBIDDEN");
        }
    }

    /**
     * Kiểm tra session có thể bắt đầu live không.
     * Host chỉ được start trong window 30 phút trước giờ hẹn.
     */
    public void validateCanStart(LiveStreamSession session, UUID requestingUserId) {
        validateIsHost(session, requestingUserId);

        if (session.getStatus() != SessionStatus.SCHEDULED) {
            throw new BusinessRuleException(
                    "Phiên stream không ở trạng thái SCHEDULED",
                    "STREAM_NOT_SCHEDULED");
        }
        LocalDateTime earliest = session.getScheduledAt().minusMinutes(30);
        if (LocalDateTime.now().isBefore(earliest)) {
            throw new BusinessRuleException(
                    "Chỉ có thể bắt đầu stream trong vòng 30 phút trước giờ hẹn",
                    "STREAM_START_TOO_EARLY");
        }
    }

    /**
     * Kiểm tra employer có thể spotlight một job post không.
     * Job phải thuộc cùng company với session.
     */
    public void validateCanSpotlightJob(LiveStreamSession session, UUID jobCompanyId) {
        if (!session.isLive()) {
            throw new BusinessRuleException(
                    "Chỉ có thể spotlight job khi stream đang LIVE",
                    "STREAM_NOT_LIVE");
        }
        if (!session.getCompanyId().equals(jobCompanyId)) {
            throw new BusinessRuleException(
                    "Job post không thuộc công ty của phiên stream này",
                    "STREAM_JOB_COMPANY_MISMATCH");
        }
    }

    /**
     * Kiểm tra có thể mời candidate vào interview slot không.
     */
    public void validateCanInviteToSlot(LiveStreamSession session, UUID requestingUserId) {
        if (!session.isHostedBy(requestingUserId)) {
            throw new BusinessRuleException(
                    "Chỉ host mới có thể gửi lời mời phỏng vấn",
                    "STREAM_INVITE_FORBIDDEN");
        }
        if (!session.isLive()) {
            throw new BusinessRuleException(
                    "Chỉ có thể mời phỏng vấn khi stream đang LIVE",
                    "STREAM_NOT_LIVE");
        }
    }

    /**
     * Kiểm tra candidate có thể join session không.
     */
    public void validateCanJoin(LiveStreamSession session) {
        if (!session.isLive()) {
            throw new BusinessRuleException(
                    "Phiên stream chưa bắt đầu hoặc đã kết thúc",
                    "STREAM_NOT_LIVE");
        }
    }
}