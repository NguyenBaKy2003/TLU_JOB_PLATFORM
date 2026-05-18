package edu.tlu.jobplatform.ai.domain.port;

import java.util.UUID;

import edu.tlu.jobplatform.ai.domain.model.AutocompleteResult;

public interface SearchAutocompletePort {
    AutocompleteResult suggest(UUID candidateId, String partialQuery);
}