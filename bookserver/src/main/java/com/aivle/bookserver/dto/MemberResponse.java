package com.aivle.bookserver.dto;

import com.aivle.bookserver.domain.Member;
import com.aivle.bookserver.domain.MemberRole;

public record MemberResponse(
        Long id,
        String email,
        String nickname,
        String profileImageUrl,
        MemberRole role
) {
    public static MemberResponse from(Member member) {
        return new MemberResponse(
                member.getId(),
                member.getEmail(),
                member.getNickname(),
                member.getProfileImageUrl(),
                member.getRole()
        );
    }
}
