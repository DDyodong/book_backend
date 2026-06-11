package com.aivle.bookserver.dto;

import com.aivle.bookserver.domain.Book;
import java.time.LocalDateTime;
import java.util.List;

public record BookResponse(
        Long id,
        String title,
        String author,
        List<String> genre,
        String content,
        String coverImageUrl,
        Integer views,
        Integer likes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    // Entity → DTO 변환 메서드
    public static BookResponse from(Book book) {
        return new BookResponse(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getGenre(),
                book.getContent(),
                book.getCoverImageUrl(),
                book.getViews(),
                book.getLikes(),
                book.getCreatedAt(),
                book.getUpdatedAt()
        );
    }
}