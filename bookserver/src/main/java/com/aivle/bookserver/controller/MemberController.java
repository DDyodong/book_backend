package com.aivle.bookserver.controller;

import com.aivle.bookserver.domain.AuthorRequest;
import com.aivle.bookserver.domain.Member;
import com.aivle.bookserver.dto.AuthorRequestResponse;
import com.aivle.bookserver.dto.MemberResponse;
import com.aivle.bookserver.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/me")
    public MemberResponse getCurrentMember(Authentication authentication) {
        return memberService.findCurrentMember(authentication)
                .map(MemberResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @PostMapping("/me/author-request")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthorRequestResponse requestAuthor(Authentication authentication) {
        Member member = memberService.findCurrentMember(authentication)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        AuthorRequest request = memberService.requestAuthor(member);
        return AuthorRequestResponse.from(request);
    }
}
