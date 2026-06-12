package edu.tlu.jobplatform.ai.application.usecase;

import edu.tlu.jobplatform.ai.domain.model.CandidateProfileSummary;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.model.DesiredJob;
import edu.tlu.jobplatform.candidate.domain.model.Education;
import edu.tlu.jobplatform.candidate.domain.model.Skill;
import edu.tlu.jobplatform.candidate.domain.model.WorkExperience;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper dùng chung để chuyển CandidateProfile -> CandidateProfileSummary
 * cho cả SmartSearch và AutoSuggest, đảm bảo dữ liệu gửi cho AI
 * (học vấn, kinh nghiệm, số năm) là chính xác và đầy đủ.
 */
public final class CandidateSummaryMapper {

    private static final DateTimeFormatter PERIOD_FMT = DateTimeFormatter.ofPattern("MM/yyyy");
    private static final int MAX_DESC_LENGTH = 150;

    private CandidateSummaryMapper() {
    }

    public static CandidateProfileSummary toSummary(CandidateProfile p) {
        return CandidateProfileSummary.builder()
                .id(p.getId())
                .fullName(p.getFirstName() + " " + p.getLastName())
                .headline(p.getHeadline())
                .location(p.getLocation())
                .jobSearchStatus(p.getJobSearchStatus() != null
                        ? p.getJobSearchStatus().name()
                        : "")
                .skills(p.getSkills().stream().map(Skill::getName).toList())
                .levelSummary(p.getDesiredJobs().stream().findFirst()
                        .map(dj -> dj.getLevels().stream()
                                .map(DesiredJob.Level::name)
                                .collect(Collectors.joining("/")))
                        .orElse(""))
                .educationSummary(buildEducationSummary(p.getEducations()))
                .experienceDetails(buildExperienceDetails(p.getExperiences()))
                .totalExperienceYears(calculateTotalExperienceYears(p.getExperiences()))
                .build();
    }

    /**
     * Tổng hợp TẤT CẢ bằng cấp/học vấn của ứng viên, không chỉ lấy cái đầu tiên.
     */
    private static String buildEducationSummary(List<Education> educations) {
        if (educations.isEmpty()) {
            return "Chưa cập nhật học vấn";
        }
        return educations.stream()
                .map(e -> "%s - %s (%s)".formatted(
                        nullSafe(e.getDegree()),
                        nullSafe(e.getMajor()),
                        nullSafe(e.getSchool())))
                .collect(Collectors.joining("; "));
    }

    /**
     * Chi tiết từng kinh nghiệm làm việc: vị trí, công ty, thời gian, mô tả ngắn.
     */
    private static String buildExperienceDetails(List<WorkExperience> experiences) {
        if (experiences.isEmpty()) {
            return "Chưa có kinh nghiệm làm việc";
        }
        return experiences.stream()
                .map(e -> {
                    String period = formatPeriod(e.getStartDate(), e.getEndDate(), e.isCurrent());
                    String desc = (e.getDescription() != null && !e.getDescription().isBlank())
                            ? " - " + truncate(e.getDescription(), MAX_DESC_LENGTH)
                            : "";
                    return "%s tại %s (%s)%s".formatted(
                            nullSafe(e.getPosition()),
                            nullSafe(e.getCompanyName()),
                            period,
                            desc);
                })
                .collect(Collectors.joining("; "));
    }

    /**
     * Tổng số năm kinh nghiệm tính từ ngày bắt đầu/kết thúc thực tế của từng
     * công việc, thay vì ước lượng kiểu experiences.size() * 2.
     *
     * Lưu ý: cộng dồn theo từng job, nếu có job chồng thời gian thì tổng
     * sẽ bị cộng dư — chấp nhận được cho mục đích ước lượng độ phù hợp.
     */
    private static int calculateTotalExperienceYears(List<WorkExperience> experiences) {
        long totalMonths = experiences.stream()
                .mapToLong(e -> {
                    LocalDate start = e.getStartDate();
                    LocalDate end = e.isCurrent() ? LocalDate.now() : e.getEndDate();
                    if (start == null || end == null || end.isBefore(start)) {
                        return 0L;
                    }
                    return ChronoUnit.MONTHS.between(start, end);
                })
                .sum();
        return (int) (totalMonths / 12);
    }

    private static String formatPeriod(LocalDate start, LocalDate end, boolean current) {
        String startStr = start != null ? start.format(PERIOD_FMT) : "?";
        String endStr = current ? "hiện tại" : (end != null ? end.format(PERIOD_FMT) : "?");
        return startStr + " - " + endStr;
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return "";
        }
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }

    private static String nullSafe(String s) {
        return s != null ? s : "";
    }
}