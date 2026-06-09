package com.aivle.bookserver.repository;

import com.aivle.bookserver.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {
}