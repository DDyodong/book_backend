package com.aivle.bookserver.service;

import com.aivle.bookserver.domain.Book;
import com.aivle.bookserver.domain.Comment;
import com.aivle.bookserver.domain.Member;
import com.aivle.bookserver.dto.CommentCreateRequest;
import com.aivle.bookserver.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final BookService bookService;
    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public List<Comment> getComments(Long bookId) {
        return commentRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    }

    @Transactional
    public Comment createComment(Long bookId, Member member, CommentCreateRequest request) {
        Book book = bookService.getBook(bookId);

        Comment comment = new Comment();
        comment.setBook(book);
        comment.setMember(member);
        comment.setContent(request.content().trim());

        return commentRepository.save(comment);
    }
}
