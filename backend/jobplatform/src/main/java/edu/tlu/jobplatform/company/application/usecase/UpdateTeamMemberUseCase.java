package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyTeamMember;
import edu.tlu.jobplatform.company.domain.repository.CompanyTeamMemberRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateTeamMemberUseCase {

    private final CompanyTeamMemberRepository memberRepository;

    @Transactional
    public CompanyTeamMember execute(UUID companyId, UUID memberId, Command cmd) {
        CompanyTeamMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> ResourceNotFoundException.of("TeamMember", memberId));

        if (!member.getCompanyId().equals(companyId))
            throw new BusinessRuleException(
                    "Bạn không có quyền chỉnh sửa thành viên này.", "FORBIDDEN");

        member.update(cmd.fullName(), cmd.jobTitle(), cmd.bio(),
                cmd.linkedinUrl(), cmd.displayOrder());

        return memberRepository.save(member);
    }

    public record Command(
            String fullName,
            String jobTitle,
            String bio,
            String linkedinUrl,
            int displayOrder) {
    }
}