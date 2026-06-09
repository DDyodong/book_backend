package com.aivle.bookserver.repository;

import com.aivle.bookserver.domain.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    // 1. 작가별 작품 모아보기 기능
    List<Book> findByAuthorId(Long authorId);

    // 2. 검색 기능 (제목 또는 내용에 키워드가 포함된 책 검색)
    List<Book> findByTitleContainingOrContentContaining(String titleKeyword, String contentKeyword);

    // 3. 최신순 조회 (Id 역순 또는 생성일 역순)
    List<Book> findAllByOrderByIdDesc();

    // 4. 추천순(좋아요순) 조회
    List<Book> findAllByOrderByLikesDesc();

    // 5. 정렬 기능 - 조회수순 조회
    List<Book> findAllByOrderByViewsDesc();
}