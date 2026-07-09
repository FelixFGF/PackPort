package com.packbridge.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
public class FileTypeValidationException extends RuntimeException {
    public FileTypeValidationException(String message) {
        super(message);
    }
}
