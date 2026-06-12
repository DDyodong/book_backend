package com.aivle.bookserver.controller;

import com.aivle.bookserver.domain.AuthorRequest;
import com.aivle.bookserver.domain.Member;
import com.aivle.bookserver.dto.AuthorRequestResponse;
import com.aivle.bookserver.dto.BookResponse;
import com.aivle.bookserver.dto.DemoRoleRequest;
import com.aivle.bookserver.dto.MemberResponse;
import com.aivle.bookserver.service.MemberService;
import org.springframework.web.bind.annotation.PatchMapping;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

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

    @GetMapping("/me/liked-books")
    public List<BookResponse> getLikedBooks(Authentication authentication) {
        Member member = memberService.findCurrentMember(authentication)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return memberService.getLikedBooks(member)
                .stream()
                .map(BookResponse::from)
                .toList();

    }

    @PatchMapping("/me/demo-role")
    public MemberResponse updateDemoRole(
            Authentication authentication,
            @RequestBody DemoRoleRequest request
    ) {
        Member member = memberService.requireCurrentMember(authentication);
        return MemberResponse.from(memberService.updateDemoAuthorRole(member, request.authorEnabled()));
    }
}
