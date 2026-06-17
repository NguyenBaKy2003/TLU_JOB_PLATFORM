package edu.tlu.jobplatform.candidate.application.usecase.profile;

import edu.tlu.jobplatform.shared.port.FileStoragePort;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateAvatarUseCase {

    private static final String AVATAR_FOLDER = "avatars";
    private static final long MAX_SIZE = 5L * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp");

    private final CandidateProfileRepository profileRepository;
    private final FileStoragePort fileStorage;

    @Transactional
    public CandidateProfile execute(UUID userId, MultipartFile file) {
        if (file.isEmpty())
            throw new BusinessRuleException("File không được để trống.", "FILE_EMPTY");
        if (file.getSize() > MAX_SIZE)
            throw new BusinessRuleException("Ảnh tối đa 5MB.", "FILE_TOO_LARGE");
        if (!ALLOWED_TYPES.contains(file.getContentType()))
            throw new BusinessRuleException(
                    "Chỉ chấp nhận JPEG, PNG, WEBP.", "INVALID_FILE_TYPE");

        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Hồ sơ không tồn tại.", "PROFILE_NOT_FOUND"));

        try {
            String url = fileStorage.upload(
                    file.getInputStream(),
                    file.getOriginalFilename(),
                    file.getContentType(),
                    AVATAR_FOLDER);

            profile.updateAvatar(url);
        } catch (IOException e) {
            throw new BusinessRuleException("Không thể đọc file.", "FILE_READ_ERROR");
        }

        return profileRepository.save(profile);
    }
}