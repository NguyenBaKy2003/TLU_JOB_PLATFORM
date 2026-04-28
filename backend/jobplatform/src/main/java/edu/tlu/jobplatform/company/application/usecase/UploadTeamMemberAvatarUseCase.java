package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyTeamMember;
import edu.tlu.jobplatform.company.domain.repository.CompanyTeamMemberRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.port.FileStoragePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadTeamMemberAvatarUseCase {

    private static final long MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

    private final CompanyTeamMemberRepository memberRepository;
    private final FileStoragePort fileStorage;

    @Transactional
    public CompanyTeamMember execute(UUID companyId, UUID memberId, MultipartFile file) {
        CompanyTeamMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> ResourceNotFoundException.of("TeamMember", memberId));

        if (!member.getCompanyId().equals(companyId))
            throw new BusinessRuleException(
                    "Bạn không có quyền chỉnh sửa thành viên này.", "FORBIDDEN");

        if (file.getSize() > MAX_FILE_SIZE)
            throw new BusinessRuleException("Ảnh vượt quá 3MB.", "FILE_TOO_LARGE");

        String mime = file.getContentType();
        if (mime == null || !mime.startsWith("image/"))
            throw new BusinessRuleException("Chỉ chấp nhận file ảnh.", "INVALID_FILE_TYPE");

        try {
            String imageUrl = fileStorage.upload(
                    file.getInputStream(),
                    file.getOriginalFilename(),
                    mime,
                    "companies/" + companyId + "/team");

            member.updateAvatar(imageUrl);
            CompanyTeamMember saved = memberRepository.save(member);
            log.info("TeamMember avatar updated: member={} url={}", memberId, imageUrl);
            return saved;

        } catch (IOException e) {
            throw new BusinessRuleException("Không thể đọc file ảnh.", "FILE_READ_ERROR");
        }
    }
}