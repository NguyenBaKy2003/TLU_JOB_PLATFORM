package edu.tlu.jobplatform.candidate.infrastructure.event;

import edu.tlu.jobplatform.shared.event.candidate.CVUploadedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CVUploadedEventHandler {

    @Async
    @EventListener
    public void handle(CVUploadedEvent event) {
        log.info("CVUploadedEvent: cvId={} candidateId={} primary={} contentLength={}",
                event.getCvId(),
                event.getCandidateId(),
                event.isPrimary(),
                event.getParsedText().length());

        // Sprint 5: embeddingPort.embed(event.getCvId(), event.getParsedText());
    }
}