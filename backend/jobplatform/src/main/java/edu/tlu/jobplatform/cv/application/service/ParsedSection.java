package edu.tlu.jobplatform.cv.application.service;

public record ParsedSection(
        String id,
        String type,
        String title,
        boolean visible,
        int displayOrder,
        Object data) {
}