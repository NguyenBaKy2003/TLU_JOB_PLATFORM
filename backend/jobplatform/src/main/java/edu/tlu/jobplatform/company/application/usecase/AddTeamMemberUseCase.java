package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyTeamMember;
import edu.tlu.jobplatform.company.domain.repository.CompanyTeamMemberRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddTeamMemberUseCase {

    private static final int MAX_TEAM_MEMBERS = 20;

    private final CompanyTeamMemberRepository memberRepository;

    @Transactional
    public CompanyTeamMember execute(Command cmd) {
        int count = memberRepository.countByCompanyId(cmd.companyId());
        if (count >= MAX_TEAM_MEMBERS)
            throw new BusinessRuleException(
                    "Tối đa " + MAX_TEAM_MEMBERS + " thành viên đội ngũ.",
                    "TEAM_MEMBER_LIMIT_EXCEEDED");

        CompanyTeamMember member = CompanyTeamMember.builder()
                .id(UUID.randomUUID())
                .companyId(cmd.companyId())
                .fullName(cmd.fullName())
                .jobTitle(cmd.jobTitle())
                .bio(cmd.bio())
                .linkedinUrl(cmd.linkedinUrl())
                .displayOrder(cmd.displayOrder() >= 0 ? cmd.displayOrder() : count)
                .visible(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        CompanyTeamMember saved = memberRepository.save(member);
        log.info("TeamMember added: company={} member={}", cmd.companyId(), saved.getId());
        return saved;
    }

    public record Command(
            UUID companyId,
            String fullName,
            String jobTitle,
            String bio,
            String linkedinUrl,
            int displayOrder) {
    }
}