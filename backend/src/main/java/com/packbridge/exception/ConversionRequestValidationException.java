package com.packbridge.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ConversionRequestValidationException extends RuntimeException {
    public ConversionRequestValidationException(String message) {
        super(message);
    }
}