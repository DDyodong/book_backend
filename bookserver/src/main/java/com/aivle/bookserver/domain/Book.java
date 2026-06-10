package com.aivle.bookserver.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*; // 검증용 import 추가
import lombok.*;
import java.time.LocalDateTime;
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

    @NotBlank(message = "제목은 필수입니다.")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "작성자(Author)는 필수입니다.")
    @Column(nullable = false)
    private String author;

    @Size(max = 1000, message = "내용은 1000자 이내여야 합니다.")
    @Column(length = 1000)
    private String content;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String coverImageUrl;

    // 장르 리스트를 별도 테이블로 매핑하여 저장
    @NotEmpty(message = "최소 하나의 장르를 선택해야 합니다.")
    @ElementCollection
    @CollectionTable(name = "book_genres", joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "genre")
    private List<String> genres = new ArrayList<>();

    @Column(nullable = false)
    private Integer views = 0;

    // 조장님 피드백: 좋아요 개수 추적용 필드 (성능 최적화용)
    @Column(nullable = false)
    private Integer likesCount = 0;

    // 유저별 좋아요 여부 추적 (BookLike 엔티티와 양방향 매핑)
    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookLike> bookLikes = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @JsonProperty("genre")
    public List<String> getGenre() {
        return genres;
    }

    public void setGenre(List<String> genre) {
        this.genres = genre;
    }

    @JsonProperty("likes")
    public Integer getLikes() {
        return likesCount;
    }

    public void setLikes(Integer likes) {
        this.likesCount = likes;
    }
}
