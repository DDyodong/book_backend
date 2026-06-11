package com.aivle.bookserver.service;

import com.aivle.bookserver.domain.Book;
import com.aivle.bookserver.domain.Comment;
import com.aivle.bookserver.domain.Member;
import com.aivle.bookserver.dto.CommentCreateRequest;
import com.aivle.bookserver.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    // 도배 방지 상수
    private static final int COOLDOWN_SECONDS    = 10;   // 댓글 간 몇 초
    private static final int MAX_PER_BOOK        = 5;    // 한 도서 몇 개까지
    private static final int MIN_CONTENT_LENGTH  = 2;    // 2글자 이상
    private static final int MAX_CONTENT_LENGTH  = 500;  //500자 이하.

    private final BookService bookService;
    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public List<Comment> getComments(Long bookId) {
        return commentRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    }

    @Transactional
    public Comment createComment(Long bookId, Member member, CommentCreateRequest request) {

        String content = request.content().trim();

        if (content.length() < MIN_CONTENT_LENGTH) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "댓글은 최소 " + MIN_CONTENT_LENGTH + "자 이상 입력해주세요."
            );
        }
        if (content.length() > MAX_CONTENT_LENGTH) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "댓글은 " + MAX_CONTENT_LENGTH + "자 이하로 입력해주세요."
            );
        }

        LocalDateTime cooldownBoundary = LocalDateTime.now().minusSeconds(COOLDOWN_SECONDS);
        long recentCount = commentRepository.countRecentByMember(member.getId(), cooldownBoundary);
        if (recentCount > 0) {
            throw new ResponseStatusException(
                HttpStatus.TOO_MANY_REQUESTS,
                "댓글은 " + COOLDOWN_SECONDS + "초에 한 번만 작성할 수 있습니다."
            );
        }

        long commentCountOnBook = commentRepository.countByMemberAndBook(member.getId(), bookId);
        if (commentCountOnBook >= MAX_PER_BOOK) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "한 도서에 최대 " + MAX_PER_BOOK + "개까지 댓글을 작성할 수 있습니다."
            );
        }

        Book book = bookService.getBook(bookId);
        Comment comment = new Comment();
        comment.setBook(book);
        comment.setMember(member);
        comment.setContent(content);

        return commentRepository.save(comment);
    }
}