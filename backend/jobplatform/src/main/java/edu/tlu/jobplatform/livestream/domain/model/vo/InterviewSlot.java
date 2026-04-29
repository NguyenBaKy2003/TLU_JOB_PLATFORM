package edu.tlu.jobplatform.livestream.domain.model.vo;

import java.time.LocalDateTime;
import java.util.UUID;

public record InterviewSlot(
        UUID slotId,
        LocalDateTime startTime,
        int durationMinutes,
        UUID assignedCandidateId, // null nếu chưa assign
        SlotStatus status) {
    public enum SlotStatus {
        OPEN, BOOKED, DONE, CANCELLED
    }

    public boolean isAvailable() {
        return status == SlotStatus.OPEN && assignedCandidateId == null;
    }

    public InterviewSlot assignTo(UUID candidateId) {
        if (!isAvailable()) {
            throw new IllegalStateException("Slot này đã được đặt hoặc không còn trống");
        }
        return new InterviewSlot(slotId, startTime, durationMinutes, candidateId, SlotStatus.BOOKED);
    }
}