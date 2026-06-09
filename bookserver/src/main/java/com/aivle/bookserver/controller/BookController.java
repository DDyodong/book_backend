package com.aivle.bookserver.controller;

import com.aivle.bookserver.domain.Book;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.aivle.bookserver.service.BookService;
import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    public List<Book> getBooks() {
        return bookService.getBooks();
    }
}