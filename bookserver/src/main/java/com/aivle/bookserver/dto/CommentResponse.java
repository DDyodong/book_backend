package com.aivle.bookserver.dto;

import com.aivle.bookserver.domain.Comment;
import com.aivle.bookserver.domain.Member;
import com.aivle.bookserver.domain.MemberRole;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        String content,
        LocalDateTime createdAt,
        Long memberId,
        String memberName,
        String memberRole,
        String memberRoleLabel
) {
    public static CommentResponse from(Comment comment) {
        Member member = comment.getMember();
        MemberRole role = member.getRole();
        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                member.getId(),
                member.getNickname() != null && !member.getNickname().isBlank()
                        ? member.getNickname()
                        : member.getEmail(),
                role.name(),
                roleLabel(role)
        );
    }

    private static String roleLabel(MemberRole role) {
        return switch (role) {
            case AUTHOR -> "저자";
            case ADMIN -> "관리자";
            case USER -> "회원";
        };
    }
}
