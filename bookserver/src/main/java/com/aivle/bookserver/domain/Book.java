package com.aivle.bookserver.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String content;

    @Column(length = 5000)
    private String coverImageUrl;

    @Column(nullable = false)
    private Integer views = 0;

    @Column(nullable = false)
    private Integer likes = 0;


     /*User, Author, Comment 클래스 생선 전 주석 처리
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    /*private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private Author author;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();*/
}