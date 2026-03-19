package com.example.security.exception;

import com.example.security.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice(basePackages = "com.example.security")  // ✅ ONLY THIS LINE CHANGED
public class GlobalExceptionHandler {
    
    // Remove all the skipExceptionHandling checks - you don't need them anymore!
    
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(
            IllegalStateException ex,
            WebRequest request) {  // Remove HttpServletRequest parameter too
        
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ErrorResponse.builder()
                        .timestamp(Instant.now())
                        .status(HttpStatus.CONFLICT.value())
                        .error("Conflict")
                        .code("CONFLICT")
                        .message(ex.getMessage())
                        .path(request.getDescription(false).replace("uri=", ""))
                        .build());
    }
    
    // ... rest of your handlers (remove skipExceptionHandling checks from all)


        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ErrorResponse> handleBadCredentials(
                        BadCredentialsException ex,
                        WebRequest request,
                        HttpServletRequest httpRequest) {

                // Skip if it's a Swagger request
                if (Boolean.TRUE.equals(httpRequest.getAttribute("skipExceptionHandling"))) {
                        return null; // Let Spring handle it
                }

                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(ErrorResponse.builder()
                                                .timestamp(Instant.now())
                                                .status(HttpStatus.UNAUTHORIZED.value())
                                                .error("Unauthorized")
                                                .code("AUTH_FAILED")
                                                .message("Invalid credentials")
                                                .path(request.getDescription(false).replace("uri=", ""))
                                                .build());
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ErrorResponse> handleAccessDenied(
                        AccessDeniedException ex,
                        WebRequest request,
                        HttpServletRequest httpRequest) {

                // Skip if it's a Swagger request
                if (Boolean.TRUE.equals(httpRequest.getAttribute("skipExceptionHandling"))) {
                        return null; // Let Spring handle it
                }

                return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(ErrorResponse.builder()
                                                .timestamp(Instant.now())
                                                .status(HttpStatus.FORBIDDEN.value())
                                                .error("Forbidden")
                                                .code("ACCESS_DENIED")
                                                .message("Insufficient privileges")
                                                .path(request.getDescription(false).replace("uri=", ""))
                                                .build());
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidation(
                        MethodArgumentNotValidException ex,
                        WebRequest request,
                        HttpServletRequest httpRequest) {

                // Skip if it's a Swagger request
                if (Boolean.TRUE.equals(httpRequest.getAttribute("skipExceptionHandling"))) {
                        return null; // Let Spring handle it
                }

                Map<String, String> errors = new HashMap<>();
                ex.getBindingResult().getAllErrors().forEach(error -> {
                        String fieldName = ((FieldError) error).getField();
                        String message = error.getDefaultMessage();
                        errors.put(fieldName, message);
                });

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ErrorResponse.builder()
                                                .timestamp(Instant.now())
                                                .status(HttpStatus.BAD_REQUEST.value())
                                                .error("Validation Error")
                                                .code("VALIDATION_ERROR")
                                                .message("Validation failed")
                                                .details(errors)
                                                .path(request.getDescription(false).replace("uri=", ""))
                                                .build());
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ErrorResponse> handleRuntime(
                        RuntimeException ex,
                        WebRequest request,
                        HttpServletRequest httpRequest) {

                // Skip if it's a Swagger request
                if (Boolean.TRUE.equals(httpRequest.getAttribute("skipExceptionHandling"))) {
                        return null; // Let Spring handle it
                }

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ErrorResponse.builder()
                                                .timestamp(Instant.now())
                                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                                .error("Internal Server Error")
                                                .code("INTERNAL_ERROR")
                                                .message(ex.getMessage())
                                                .path(request.getDescription(false).replace("uri=", ""))
                                                .build());
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGeneric(
                        Exception ex,
                        WebRequest request,
                        HttpServletRequest httpRequest) {

                // Skip if it's a Swagger request
                if (Boolean.TRUE.equals(httpRequest.getAttribute("skipExceptionHandling"))) {
                        return null; // Let Spring handle it
                }

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ErrorResponse.builder()
                                                .timestamp(Instant.now())
                                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                                .error("Internal Server Error")
                                                .code("INTERNAL_ERROR")
                                                .message("Something went wrong")
                                                .path(request.getDescription(false).replace("uri=", ""))
                                                .build());
        }
}