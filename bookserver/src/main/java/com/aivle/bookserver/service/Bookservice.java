
package com.aivle.bookserver.service;

import com.aivle.bookserver.domain.Book;
import com.aivle.bookserver.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    // 목록 조회
    @Transactional(readOnly = true)
    public List<Book> findAll() {
        return null;
    }

    // 책 정보 상세 조회 
    @Transactional(readOnly = true)
    public Book findById(Long id) {
        return null;
    }

    // 등록 
    @Transactional
    public Book create(Book book) {
        return null;
    }

    // 책 정보 수정 / 조회수 / 좋아요 통합 처리 
    @Transactional
    public Book update(Long id, Book book) {
        return null;
    }

    // 삭제
    @Transactional
    public void deleteBook(Long id) {
    }

}