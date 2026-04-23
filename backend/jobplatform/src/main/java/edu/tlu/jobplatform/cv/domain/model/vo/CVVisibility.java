package edu.tlu.jobplatform.cv.domain.model.vo;

/**
 * Quyền truy cập public CV.
 *
 * PRIVATE — chỉ owner thấy (dù status = PUBLISHED)
 * PUBLIC — ai cũng xem được qua /public/cv/{slug}
 * LINK_ONLY — chỉ ai có link mới xem được (không index search)
 */
public enum CVVisibility {
    PRIVATE,
    PUBLIC,
    LINK_ONLY
}