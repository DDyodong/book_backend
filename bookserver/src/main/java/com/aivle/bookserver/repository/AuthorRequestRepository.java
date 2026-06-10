package com.aivle.bookserver.repository;

import com.aivle.bookserver.domain.AuthorRequest;
import com.aivle.bookserver.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuthorRequestRepository extends JpaRepository<AuthorRequest, Long> {

    List<AuthorRequest> findByMemberOrderByCreatedAtDesc(Member member);
}
