package com.aivle.bookserver.repository;

import com.aivle.bookserver.domain.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = "member")
    List<Comment> findByBookIdOrderByCreatedAtDesc(Long bookId);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.member.id = :memberId AND c.createdAt >= :since")
    long countRecentByMember(@Param("memberId") Long memberId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.member.id = :memberId AND c.book.id = :bookId")
    long countByMemberAndBook(@Param("memberId") Long memberId, @Param("bookId") Long bookId);
}