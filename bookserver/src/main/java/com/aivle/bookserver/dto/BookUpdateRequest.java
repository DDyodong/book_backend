package com.aivle.bookserver.dto;

import java.util.List;

public record BookUpdateRequest(
        String title,
        String author,
        List<String> genre,
        String content,
        String coverImageUrl,
        Integer views,
        Integer likes
) {
}
