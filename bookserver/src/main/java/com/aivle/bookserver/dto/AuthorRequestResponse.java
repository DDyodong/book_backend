package com.aivle.bookserver.dto;

import com.aivle.bookserver.domain.AuthorRequest;
import com.aivle.bookserver.domain.AuthorRequestStatus;

import java.time.LocalDateTime;

public record AuthorRequestResponse(
        Long id,
        Long memberId,
        AuthorRequestStatus status,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {
    public static AuthorRequestResponse from(AuthorRequest request) {
        return new AuthorRequestResponse(
                request.getId(),
                request.getMember().getId(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getReviewedAt()
        );
    }
}
