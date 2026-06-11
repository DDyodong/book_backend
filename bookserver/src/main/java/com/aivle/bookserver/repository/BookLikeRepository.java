package com.aivle.bookserver.repository;

import com.aivle.bookserver.domain.Book;
import com.aivle.bookserver.domain.BookLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookLikeRepository extends JpaRepository<BookLike, Long> {

    @Query("SELECT bl.book FROM BookLike bl WHERE bl.member.id = :memberId ORDER BY bl.createdAt DESC")
    List<Book> findLikedBooksByMemberId(@Param("memberId") Long memberId);

    Optional<BookLike> findByMemberIdAndBookId(Long memberId, Long bookId);

    boolean existsByMemberIdAndBookId(Long memberId, Long bookId);
}
