package com.aivle.bookserver.dto;

import jakarta.validation.constraints.NotBlank;

public record CoverGenerateRequest(
        @NotBlank(message = "표지 생성 프롬프트는 필수입니다.")
        String prompt
) {
}
