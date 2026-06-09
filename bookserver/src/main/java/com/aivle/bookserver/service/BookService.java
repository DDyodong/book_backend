package com.aivle.bookserver.service;

import com.aivle.bookserver.domain.Book;
import com.aivle.bookserver.exception.BookNotFoundException;
import com.aivle.bookserver.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    // 전체 도서 조회
    public List<Book> getBooks() {
        return bookRepository.findAll();
    }

    // 단일 도서 조회
    public Book getBook(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new BookNotFoundException(id));
    }

    // 도서 등록
    public Book createBook(Book book) {
        return bookRepository.save(book);
    }

    // 도서 수정
    public Book updateBook(Long id, Book request) {
        Book book = getBook(id);

        book.setTitle(request.getTitle());
        book.setContent(request.getContent());
        book.setGenre(request.getGenre());
        book.setCoverImageUrl(request.getCoverImageUrl());

        return bookRepository.save(book);
    }

    // 도서 삭제
    public void deleteBook(Long id) {
        Book book = getBook(id);
        bookRepository.delete(book);
    }
}