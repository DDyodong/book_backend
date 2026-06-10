package com.aivle.bookserver.service;

import com.aivle.bookserver.domain.AuthorRequest;
import com.aivle.bookserver.domain.AuthorRequestStatus;
import com.aivle.bookserver.domain.Member;
import com.aivle.bookserver.domain.MemberRole;
import com.aivle.bookserver.repository.AuthorRequestRepository;
import com.aivle.bookserver.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private static final String GOOGLE = "google";

    private final MemberRepository memberRepository;
    private final AuthorRequestRepository authorRequestRepository;

    @Transactional
    public Member saveOrUpdateGoogleMember(OAuth2User user) {
        String providerId = user.getAttribute("sub");
        String email = user.getAttribute("email");
        String nickname = user.getAttribute("name");
        String picture = user.getAttribute("picture");

        Member member = memberRepository.findByProviderAndProviderId(GOOGLE, providerId)
                .orElseGet(() -> {
                    Member newMember = new Member();
                    newMember.setProvider(GOOGLE);
                    newMember.setProviderId(providerId);
                    newMember.setRole(MemberRole.USER);
                    return newMember;
                });

        member.setEmail(email);
        member.setNickname(nickname);
        member.setProfileImageUrl(picture);

        return memberRepository.save(member);
    }

    @Transactional(readOnly = true)
    public Optional<Member> findCurrentMember(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User user)) {
            return Optional.empty();
        }

        String providerId = user.getAttribute("sub");
        return memberRepository.findByProviderAndProviderId(GOOGLE, providerId);
    }

    @Transactional
    public AuthorRequest requestAuthor(Member member) {
        member.setRole(MemberRole.AUTHOR);

        AuthorRequest request = new AuthorRequest();
        request.setMember(member);
        request.setStatus(AuthorRequestStatus.APPROVED);
        request.setReason("사용자 저자 권한 신청");
        request.setReviewedAt(LocalDateTime.now());

        return authorRequestRepository.save(request);
    }
}
