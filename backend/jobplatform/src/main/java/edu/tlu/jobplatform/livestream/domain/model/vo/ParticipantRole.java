package edu.tlu.jobplatform.livestream.domain.model.vo;

public enum ParticipantRole {
    HOST, // Employer chủ phiên — có thể publish video/audio
    CO_HOST, // Được HOST mời lên — có thể publish
    SPEAKER, // Candidate được mời phỏng vấn — có thể publish
    VIEWER // Candidate xem — chỉ subscribe
}