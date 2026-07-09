package com.packbridge.exception;

import com.packbridge.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return new ResponseEntity<>(new ApiResponse<>(false, "Upload size exceeded. Maximum upload size is 500MB.", null), HttpStatus.PAYLOAD_TOO_LARGE);
    }

    @ExceptionHandler(FileTypeValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleFileTypeValidationException(FileTypeValidationException ex) {
        return new ResponseEntity<>(new ApiResponse<>(false, ex.getMessage(), null), HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAllExceptions(Exception ex) {
        // Log the exception for debugging purposes
        // logger.error("An error occurred: " + ex.getMessage(), ex);
        return new ResponseEntity<>(new ApiResponse<>(false, "An unexpected error occurred: " + ex.getMessage(), null), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
