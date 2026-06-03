package edu.tlu.jobplatform.company.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.company.domain.model.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Thông tin hồ sơ công ty")
public class CompanyResponse {

    // ── Thông tin cơ bản ────
    private final UUID id;
    private final UUID ownerId;
    private final String name;
    private final String slug;
    private final String description;
    private final String website;
    private final String email;
    private final String phone;
    private final String address;
    private final String city;
    private final String country;
    private final String industry;
    private final CompanySize size;
    private final String sizeLabel;
    private final Integer foundedYear;
    private final String logoUrl;
    private final String coverImageUrl;

    // ── Trạng thái xác thực ─
    private final VerificationStatus verificationStatus;
    private final String rejectionReason;
    private final boolean canPostJobs;
    private final LocalDateTime verifiedAt;
    private final LocalDateTime createdAt;
    private final Integer activeJobCount;
    private final Double averageRating;
    private final Integer reviewCount;

    /**
     * planCode của subscription ACTIVE hiện tại: ENTERPRISE / BUSINESS / STARTER /
     * FREE_COMPANY.
     * null nếu không có sub (coi như FREE).
     * FE dùng field này để render badge PRO / ENTERPRISE / v.v.
     */
    private final String planCode;

    // ── Nội dung mở rộng ────
    private final List<TeamMemberDto> teamMembers;
    private final List<GalleryImageDto> gallery;
    private final List<DocumentDto> documents; // Chỉ admin / owner thấy

    // ════════════════════════════════════════════════════════════════════════
    // Nested DTOs (giữ nguyên so với bản cũ)
    // ════════════════════════════════════════════════════════════════════════

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TeamMemberDto {
        private final UUID id;
        private final String fullName;
        private final String jobTitle;
        private final String bio;
        private final String avatarUrl;
        private final String linkedinUrl;
        private final int displayOrder;

        public static TeamMemberDto from(CompanyTeamMember m) {
            return TeamMemberDto.builder()
                    .id(m.getId())
                    .fullName(m.getFullName())
                    .jobTitle(m.getJobTitle())
                    .bio(m.getBio())
                    .avatarUrl(m.getAvatarUrl())
                    .linkedinUrl(m.getLinkedinUrl())
                    .displayOrder(m.getDisplayOrder())
                    .build();
        }
    }

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class GalleryImageDto {
        private final UUID id;
        private final String imageUrl;
        private final String caption;
        private final int displayOrder;

        public static GalleryImageDto from(CompanyGalleryImage g) {
            return GalleryImageDto.builder()
                    .id(g.getId())
                    .imageUrl(g.getImageUrl())
                    .caption(g.getCaption())
                    .displayOrder(g.getDisplayOrder())
                    .build();
        }
    }

    @Getter
    @Builder
    public static class DocumentDto {
        private final UUID id;
        private final String type;
        private final String fileName;
        private final String fileUrl;
        private final String mimeType;
        private final long fileSizeBytes;
        private final LocalDateTime uploadedAt;

        public static DocumentDto from(CompanyDocument d) {
            return DocumentDto.builder()
                    .id(d.getId())
                    .type(d.getType().name())
                    .fileName(d.getFileName())
                    .fileUrl(d.getFileUrl())
                    .mimeType(d.getMimeType())
                    .fileSizeBytes(d.getFileSizeBytes())
                    .uploadedAt(d.getUploadedAt())
                    .build();
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // Factory methods
    // ════════════════════════════════════════════════════════════════════════

    /** Public / candidate — không documents, có planCode để render badge */
    public static CompanyResponse from(CompanyProfile c,
            List<CompanyTeamMember> team,
            List<CompanyGalleryImage> gallery,
            String planCode) {
        return base(c)
                .planCode(planCode)
                .teamMembers(toTeamDtos(team))
                .gallery(toGalleryDtos(gallery))
                .activeJobCount(c.getActiveJobCount())
                .averageRating(c.getAverageRating())
                .reviewCount(c.getReviewCount())
                .build();
    }

    /**
     * Overload không có planCode — dùng cho các context không cần badge
     * (vd: employer xem hồ sơ của chính mình, admin detail).
     */
    public static CompanyResponse from(CompanyProfile c,
            List<CompanyTeamMember> team,
            List<CompanyGalleryImage> gallery) {
        return from(c, team, gallery, null);
    }

    /** Admin — có documents đầy đủ */
    public static CompanyResponse forAdmin(CompanyProfile c,
            List<CompanyTeamMember> team,
            List<CompanyGalleryImage> gallery,
            List<CompanyDocument> documents) {
        return base(c)
                .teamMembers(toTeamDtos(team))
                .gallery(toGalleryDtos(gallery))
                .documents(documents.stream().map(DocumentDto::from).toList())
                .build();
    }

    /** Owner xem hồ sơ của mình — có documents, có planCode */
    public static CompanyResponse forOwner(CompanyProfile c,
            List<CompanyTeamMember> team,
            List<CompanyGalleryImage> gallery,
            List<CompanyDocument> documents,
            String planCode) {
        return base(c)
                .planCode(planCode)
                .teamMembers(toTeamDtos(team))
                .gallery(toGalleryDtos(gallery))
                .documents(documents.stream().map(DocumentDto::from).toList())
                .build();
    }

    /** Overload forOwner không planCode — backward compat */
    public static CompanyResponse forOwner(CompanyProfile c,
            List<CompanyTeamMember> team,
            List<CompanyGalleryImage> gallery,
            List<CompanyDocument> documents) {
        return forOwner(c, team, gallery, documents, null);
    }

    // ── Helpers ──────────────

    private static CompanyResponseBuilder base(CompanyProfile c) {
        return CompanyResponse.builder()
                .id(c.getId())
                .ownerId(c.getOwnerId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .website(c.getWebsite())
                .email(c.getEmail())
                .phone(c.getPhone())
                .address(c.getAddress())
                .city(c.getCity())
                .country(c.getCountry())
                .industry(c.getIndustry())
                .size(c.getSize())
                .sizeLabel(c.getSize() != null ? c.getSize().getLabel() : null)
                .foundedYear(c.getFoundedYear())
                .logoUrl(c.getLogoUrl())
                .coverImageUrl(c.getCoverImageUrl())
                .verificationStatus(c.getVerificationStatus())
                .rejectionReason(c.getRejectionReason())
                .canPostJobs(c.canPostJobs())
                .verifiedAt(c.getVerifiedAt())
                .createdAt(c.getCreatedAt());
    }

    private static List<TeamMemberDto> toTeamDtos(List<CompanyTeamMember> team) {
        if (team == null)
            return List.of();
        return team.stream()
                .filter(CompanyTeamMember::isVisible)
                .sorted(Comparator.comparingInt(CompanyTeamMember::getDisplayOrder))
                .map(TeamMemberDto::from)
                .toList();
    }

    private static List<GalleryImageDto> toGalleryDtos(List<CompanyGalleryImage> gallery) {
        if (gallery == null)
            return List.of();
        return gallery.stream()
                .sorted(Comparator.comparingInt(CompanyGalleryImage::getDisplayOrder))
                .map(GalleryImageDto::from)
                .toList();
    }
}