package com.aivle.bookserver.repository;

import com.aivle.bookserver.domain.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = "member")
    List<Comment> findByBookIdOrderByCreatedAtDesc(Long bookId);
}
