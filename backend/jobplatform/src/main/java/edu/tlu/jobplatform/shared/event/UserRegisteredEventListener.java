package edu.tlu.jobplatform.shared.event;

import edu.tlu.jobplatform.shared.service.ProfileCreationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserRegisteredEventListener {

    private final ProfileCreationService profileCreationService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onUserRegistered(UserRegisteredEvent event) {
        log.info("Handling UserRegisteredEvent for userId={} role={}",
                event.user().getId(), event.user().getRole());
        profileCreationService.createProfileForUser(event.user());
    }
}