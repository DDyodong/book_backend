package com.aivle.bookserver.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BookCreateRequest(
        @NotBlank(message = "제목은 필수입니다.")
        String title,

        @NotBlank(message = "저자는 필수입니다.")
        String author,

        @NotEmpty(message = "장르는 하나 이상 선택해야 합니다.")
        List<String> genre,

        @NotBlank(message = "도서 소개는 필수입니다.")
        String content,

        String coverImageUrl
) {
}
