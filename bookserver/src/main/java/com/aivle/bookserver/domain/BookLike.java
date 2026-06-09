package com.aivle.bookserver.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Book.java의 mappedBy = "book" 과 이름이 같아야 함
    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;
}