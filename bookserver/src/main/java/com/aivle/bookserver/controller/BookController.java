package com.aivle.bookserver.controller;

import com.aivle.bookserver.dto.BookCreateRequest;
import com.aivle.bookserver.dto.BookCounterRequest;
import com.aivle.bookserver.dto.BookResponse;
import com.aivle.bookserver.dto.BookUpdateRequest;
import com.aivle.bookserver.service.BookService;
import com.aivle.bookserver.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final MemberService memberService;

    @GetMapping
    public List<BookResponse> getBooks() {
        return bookService.getBooks()
                .stream()
                .map(BookResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public BookResponse getBook(@PathVariable Long id) {
        return BookResponse.from(bookService.getBook(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookResponse createBook(
            @Valid @RequestBody BookCreateRequest request,
            Authentication authentication
    ) {
        memberService.requireAuthor(authentication);
        return BookResponse.from(bookService.createBook(request));
    }

    @PatchMapping("/{id}")
    public BookResponse updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookUpdateRequest request,
            Authentication authentication
    ) {
        memberService.requireAuthor(authentication);
        return BookResponse.from(bookService.updateBook(id, request));
    }

    @PatchMapping("/{id}/views")
    public BookResponse updateViews(
            @PathVariable Long id,
            @RequestBody BookCounterRequest request
    ) {
        return BookResponse.from(bookService.updateViews(id, request.value()));
    }

    @PatchMapping("/{id}/likes")
    public BookResponse updateLikes(
            @PathVariable Long id,
            @RequestBody BookCounterRequest request
    ) {
        return BookResponse.from(bookService.updateLikes(id, request.value()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(
            @PathVariable Long id,
            Authentication authentication
    ) {
        memberService.requireAuthor(authentication);
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likeBook(
            @PathVariable Long id,
            Authentication authentication
    ) {
        bookService.likeBook(id, authentication);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<Void> unlikeBook(
            @PathVariable Long id,
            Authentication authentication
    ) {
        bookService.unlikeBook(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
