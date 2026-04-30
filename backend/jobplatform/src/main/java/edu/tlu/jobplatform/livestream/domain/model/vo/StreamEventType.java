package edu.tlu.jobplatform.livestream.domain.model.vo;

public enum StreamEventType {
    CHAT, // Candidate gửi tin nhắn chat
    Q_AND_A, // Candidate đặt câu hỏi
    Q_AND_A_ANSWER, // Employer trả lời câu hỏi
    POLL_CREATED, // Employer tạo poll
    POLL_RESPONDED, // Candidate trả lời poll
    JOB_SPOTLIGHT, // Employer ghim job post lên stream
    APPLY_CTA, // Employer bật nút Apply cho job
    INTERVIEW_INVITE, // Employer mời candidate vào interview slot
    VIEWER_JOIN, // Candidate tham gia
    VIEWER_LEAVE, // Candidate rời
    SYSTEM, // Thông báo hệ thống (stream started, ended...)
    SESSION_ENDED // Phiên live kết thúc
}