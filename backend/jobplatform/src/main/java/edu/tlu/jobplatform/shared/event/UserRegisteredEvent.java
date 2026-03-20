// File: src/main/java/edu/tlu/jobplatform/shared/event/UserRegisteredEvent.java
package edu.tlu.jobplatform.shared.event;

import edu.tlu.jobplatform.user.domain.model.User;

public record UserRegisteredEvent(User user) {
}