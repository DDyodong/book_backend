package com.aivle.bookserver.controller;

import com.aivle.bookserver.domain.Comment;
import com.aivle.bookserver.domain.Member;
import com.aivle.bookserver.dto.CommentCreateRequest;
import com.aivle.bookserver.dto.CommentResponse;
import com.aivle.bookserver.service.CommentService;
import com.aivle.bookserver.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/books/{bookId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final MemberService memberService;

    @GetMapping
    public List<CommentResponse> getComments(@PathVariable Long bookId) {
        return commentService.getComments(bookId)
                .stream()
                .map(CommentResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse createComment(
            @PathVariable Long bookId,
            @Valid @RequestBody CommentCreateRequest request,
            Authentication authentication
    ) {
        Member member = memberService.findCurrentMember(authentication)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Comment comment = commentService.createComment(bookId, member, request);
        return CommentResponse.from(comment);
    }
}
