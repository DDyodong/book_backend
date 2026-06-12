package com.aivle.bookserver.service;

import com.aivle.bookserver.domain.Book;
import com.aivle.bookserver.domain.BookLike;
import com.aivle.bookserver.dto.BookCreateRequest;
import com.aivle.bookserver.dto.BookUpdateRequest;
import com.aivle.bookserver.exception.BookNotFoundException;
import com.aivle.bookserver.repository.BookLikeRepository;
import com.aivle.bookserver.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import com.aivle.bookserver.domain.Member;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final BookLikeRepository bookLikeRepository;
    private final MemberService memberService;

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
    public Book updateViews(Long id, Integer views) {
        Book book = getBook(id);
        if (views != null) {
            book.setViews(Math.max(views, 0));
        }

        return book;
    }

    @Transactional
    public Book updateLikes(Long id, Integer likes) {
        Book book = getBook(id);
        if (likes != null) {
            book.setLikes(Math.max(likes, 0));
        }

        return book;
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = getBook(id);
        bookRepository.delete(book);
    }

    @Transactional
    public void likeBook(Long bookId, Authentication authentication) {

        Member member = memberService.findCurrentMember(authentication)
                .orElseThrow();

        Book book = getBook(bookId);

        if (bookLikeRepository.existsByMemberIdAndBookId(
                member.getId(),
                bookId)) {
            return;
        }

        BookLike bookLike = new BookLike();
        bookLike.setBook(book);
        bookLike.setMember(member);

        bookLikeRepository.save(bookLike);

        book.setLikes(book.getLikes() + 1);
    }

    @Transactional
    public void unlikeBook(Long bookId, Authentication authentication) {

        Member member = memberService.findCurrentMember(authentication)
                .orElseThrow();

        BookLike like = bookLikeRepository
                .findByMemberIdAndBookId(member.getId(), bookId)
                .orElseThrow();

        bookLikeRepository.delete(like);

        Book book = getBook(bookId);

        book.setLikes(
                Math.max(book.getLikes() - 1, 0)
        );
    }

}
