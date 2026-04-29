package edu.tlu.jobplatform.livestream.infrastructure.event;

import edu.tlu.jobplatform.livestream.domain.model.StreamEvent;

/**
 * Spring Application Event publish sau khi StreamEvent được lưu vào DB.
 * StreamEventWsPusher lắng nghe event này để push WS.
 */
public record StreamEventCreatedEvent(StreamEvent streamEvent) {
}