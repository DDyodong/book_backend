package com.aivle.bookserver.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BookNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(BookNotFoundException e) {
        Map<String, String> body = Map.of(
                "error", "Book not found",
                "message", e.getMessage()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException e) {
        String message = "입력값을 확인해주세요.";
        if (e.getBindingResult().getFieldError() != null) {
            message = e.getBindingResult().getFieldError().getDefaultMessage();
        }

        Map<String, String> body = Map.of(
                "error", "Validation failed",
                "message", message
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException e) {
        Map<String, String> body = Map.of(
                "error", e.getStatusCode().toString(),
                "message", e.getReason() == null ? "요청을 처리하지 못했습니다." : e.getReason()
        );

        return ResponseEntity.status(e.getStatusCode()).body(body);
    }
}
