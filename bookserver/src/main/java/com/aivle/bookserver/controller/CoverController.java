package com.aivle.bookserver.controller;

import com.aivle.bookserver.dto.CoverGenerateRequest;
import com.aivle.bookserver.dto.CoverGenerateResponse;
import com.aivle.bookserver.service.MemberService;
import com.aivle.bookserver.service.OpenAiImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/covers")
@RequiredArgsConstructor
public class CoverController {

    private final OpenAiImageService openAiImageService;
    private final MemberService memberService;

    @PostMapping("/generate")
    public CoverGenerateResponse generateCover(
            @Valid @RequestBody CoverGenerateRequest request,
            Authentication authentication
    ) {
        memberService.requireAuthor(authentication);
        return openAiImageService.generateCover(request);
    }
}
