package edu.tlu.jobplatform.cv.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * Value Object — metadata của một template CV.
 * Immutable, chỉ đọc từ DB (admin quản lý, user không tạo mới).
 */
@Getter
@Builder
public class CVTemplate {

    private final UUID id;
    private final String name; // "Classic", "Modern", "Minimal"
    private final String thumbnailUrl; // ảnh preview
    private final String category; // "professional", "creative", "simple"
    private final boolean premium; // true = yêu cầu subscription
    private final String thymeleafTemplate; // tên file .html trong classpath
}