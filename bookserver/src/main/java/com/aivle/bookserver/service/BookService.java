package com.aivle.bookserver.service;

import com.aivle.bookserver.domain.Book;
import com.aivle.bookserver.dto.BookCreateRequest;
import com.aivle.bookserver.dto.BookUpdateRequest;
import com.aivle.bookserver.exception.BookNotFoundException;
import com.aivle.bookserver.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    @Transactional(readOnly = true)
    public List<Book> getBooks() {
        return bookRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Book getBook(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new BookNotFoundException(id));
    }

    @Transactional
    public Book createBook(BookCreateRequest request) {
        Book book = new Book();
        book.setTitle(request.title());
        book.setAuthor(request.author());
        book.setGenre(request.genre());
        book.setContent(request.content());
        book.setCoverImageUrl(request.coverImageUrl());
        book.setViews(0);
        book.setLikes(0);

        return bookRepository.save(book);
    }

    @Transactional
    public Book updateBook(Long id, BookUpdateRequest request) {
        Book book = getBook(id);

        if (request.title() != null&& !request.title().isBlank()) {
            book.setTitle(request.title());
        }
        if (request.author() != null && !request.author().isBlank()) {
            book.setAuthor(request.author());
        }
        if (request.genre() != null) {
            book.setGenre(request.genre());
        }
        if (request.content() != null) {
            book.setContent(request.content());
        }
        if (request.coverImageUrl() != null) {
            book.setCoverImageUrl(request.coverImageUrl());
        }
        if (request.views() != null) {
            book.setViews(request.views());
        }
        if (request.likes() != null) {
            book.setLikes(request.likes());
        }

        return book;
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = getBook(id);
        bookRepository.delete(book);
    }
}
