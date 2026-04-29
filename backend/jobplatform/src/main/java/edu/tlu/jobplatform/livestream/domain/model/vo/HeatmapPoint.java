package edu.tlu.jobplatform.livestream.domain.model.vo;

public record HeatmapPoint(
        int second, // giây thứ bao nhiêu trong stream
        int viewerCount // số viewer tại thời điểm đó
) {
}