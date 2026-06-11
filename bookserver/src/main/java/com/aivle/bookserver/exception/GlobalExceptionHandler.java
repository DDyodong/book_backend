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

    // 도서 없음 -> 404 응답으로 정제
    @ExceptionHandler(BookNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(BookNotFoundException e) {
        Map<String, String> body = Map.of(
                "error", "Book not found",
                "message", e.getMessage()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    // 검증 실패 -> 400 응답으로 정제
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException e) {
        // 여러 검증 에러 중 첫 번째 에러 메시지만 추출
        String msg = e.getBindingResult().getFieldError().getDefaultMessage();
        Map<String, String> body = Map.of(
                "error", "Validation failed",
                "message", msg
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
