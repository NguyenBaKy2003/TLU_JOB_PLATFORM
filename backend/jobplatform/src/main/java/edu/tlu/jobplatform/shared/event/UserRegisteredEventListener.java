// File: src/main/java/edu/tlu/jobplatform/shared/event/UserRegisteredEventListener.java
package edu.tlu.jobplatform.shared.event;

import edu.tlu.jobplatform.shared.service.ProfileCreationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserRegisteredEventListener {

    private final ProfileCreationService profileCreationService;

    @EventListener
    @Transactional
    public void onUserRegistered(UserRegisteredEvent event) {
        log.info("Handling UserRegisteredEvent for userId={}", event.user().getId());
        profileCreationService.createProfileForUser(event.user());
    }
}