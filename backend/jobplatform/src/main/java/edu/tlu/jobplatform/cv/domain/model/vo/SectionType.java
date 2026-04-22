package edu.tlu.jobplatform.cv.domain.model.vo;

/**
 * Loại section trong CV.
 * Mỗi type có schema content riêng (xem SectionContent).
 */
public enum SectionType {
    SUMMARY, // Tóm tắt bản thân
    EXPERIENCE, // Kinh nghiệm làm việc
    EDUCATION, // Học vấn
    SKILL, // Kỹ năng
    PROJECT, // Dự án
    CERTIFICATE, // Chứng chỉ
    LANGUAGE, // Ngoại ngữ
    AWARD, // Giải thưởng
    CUSTOM // Section tự do
}