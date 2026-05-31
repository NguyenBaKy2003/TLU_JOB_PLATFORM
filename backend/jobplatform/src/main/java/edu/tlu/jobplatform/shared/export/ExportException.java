package edu.tlu.jobplatform.shared.export;

import edu.tlu.jobplatform.shared.exception.DomainException;
import org.springframework.http.HttpStatus;

public class ExportException extends DomainException {

    private static final String ERROR_CODE = "EXPORT_001";

    public ExportException(String message) {
        super(message, ERROR_CODE, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public ExportException(String message, Throwable cause) {
        super(message, ERROR_CODE, HttpStatus.INTERNAL_SERVER_ERROR, cause);
    }
}