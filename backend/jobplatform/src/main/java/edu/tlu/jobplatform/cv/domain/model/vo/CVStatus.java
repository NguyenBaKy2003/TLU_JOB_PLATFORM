package edu.tlu.jobplatform.cv.domain.model.vo;

/**
 * Trạng thái của một OnlineCV.
 *
 * Transition rules:
 * DRAFT → PUBLISHED (khi publish)
 * DRAFT → ARCHIVED
 * PUBLISHED → ARCHIVED
 * ARCHIVED → DRAFT (restore)
 *
 * PUBLISHED là trạng thái duy nhất có public URL.
 */
public enum CVStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED
}