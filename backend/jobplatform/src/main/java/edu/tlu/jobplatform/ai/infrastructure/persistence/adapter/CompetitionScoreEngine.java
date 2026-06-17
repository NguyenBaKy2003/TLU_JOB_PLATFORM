package edu.tlu.jobplatform.ai.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.ai.domain.model.CompetitionRateRequest;
import edu.tlu.jobplatform.ai.domain.model.CompetitionRateResult;
import edu.tlu.jobplatform.ai.domain.model.CompetitionRateResult.Trend;
import org.springframework.stereotype.Component;

@Component
public class CompetitionScoreEngine {

    public CompetitionRateResult calculate(CompetitionRateRequest req) {
        double ratio = req.getHiringQuota() > 0
                ? (double) req.getTotalApplicants() / req.getHiringQuota()
                : req.getTotalApplicants();

        // Tiêu chí 1: Tỷ lệ đơn/chỉ tiêu (30 điểm)
        double applicantScore = calculateApplicantScore(ratio);

        // Tiêu chí 2: Chất lượng pool CV (25 điểm)
        double poolScore = calculatePoolQualityScore(req.getAverageAIScore());

        // Tiêu chí 3: Độ hot của job (15 điểm)
        double popularityScore = calculatePopularityScore(
                req.getTotalViews(), req.getTotalSaves());

        // Tiêu chí 4: Entry barrier — level càng thấp càng đông (15 điểm)
        double barrierScore = calculateBarrierScore(req.getJobLevel());

        // Tiêu chí 5: Urgency — deadline gần rush apply (15 điểm)
        double urgencyScore = calculateUrgencyScore(req.getDaysUntilDeadline());

        int total = (int) Math.round(
                applicantScore + poolScore + popularityScore
                        + barrierScore + urgencyScore);
        total = Math.min(100, Math.max(0, total));

        return CompetitionRateResult.builder()
                .competitionScore(total)
                .level(toLevel(total))
                .trend(Trend.STABLE)
                .totalApplicants(req.getTotalApplicants())
                .averageAIScore(req.getAverageAIScore())
                .hiringQuota(req.getHiringQuota())
                .applicationToHiringRatio(ratio)
                .breakdown(CompetitionRateResult.ScoreBreakdown.builder()
                        .applicantRatioScore(applicantScore)
                        .poolQualityScore(poolScore)
                        .jobPopularityScore(popularityScore)
                        .entryBarrierScore(barrierScore)
                        .urgencyScore(urgencyScore)
                        .build())
                .candidateAdvice(buildCandidateAdvice(total, ratio))
                .employerInsight(buildEmployerInsight(total, req))
                .build();
    }

    private double calculateApplicantScore(double ratio) {
        if (ratio <= 3)
            return 5;
        if (ratio <= 10)
            return 10 + (ratio - 3) * (10.0 / 7);
        if (ratio <= 20)
            return 20 + (ratio - 10) * (7.0 / 10);
        return Math.min(30, 27 + (ratio - 20) * 0.15);
    }

    private double calculatePoolQualityScore(double avgScore) {
        return avgScore * 0.25;
    }

    private double calculatePopularityScore(int views, int saves) {
        double normalized = Math.min(1.0, (views * 0.5 + saves * 2.0) / 1000.0);
        return normalized * 15;
    }

    private double calculateBarrierScore(String level) {
        if (level == null)
            return 7.5;
        return switch (level.toUpperCase()) {
            case "INTERN", "FRESHER", "JUNIOR" -> 13.0;
            case "MIDDLE" -> 8.0;
            case "SENIOR", "LEAD", "MANAGER" -> 4.0;
            default -> 7.5;
        };
    }

    private double calculateUrgencyScore(long daysLeft) {
        if (daysLeft <= 1)
            return 15;
        if (daysLeft <= 3)
            return 12;
        if (daysLeft <= 7)
            return 8;
        if (daysLeft <= 14)
            return 5;
        return 2;
    }

    private CompetitionRateResult.Level toLevel(int score) {
        if (score >= 75)
            return CompetitionRateResult.Level.EXTREME;
        if (score >= 55)
            return CompetitionRateResult.Level.HIGH;
        if (score >= 35)
            return CompetitionRateResult.Level.MEDIUM;
        return CompetitionRateResult.Level.LOW;
    }

    private String buildCandidateAdvice(int score, double ratio) {
        if (score >= 75)
            return String.format(
                    "Cạnh tranh rất cao (%.0f đơn/vị trí). Hãy tối ưu CV kỹ càng và apply sớm.", ratio);
        if (score >= 55)
            return "Cạnh tranh cao. Nên viết cover letter nổi bật.";
        if (score >= 35)
            return "Cạnh tranh vừa phải. Cơ hội tốt nếu CV phù hợp.";
        return "Cạnh tranh thấp. Đây là cơ hội tốt để apply!";
    }

    private String buildEmployerInsight(int score, CompetitionRateRequest req) {
        if (req.getTotalApplicants() < 5)
            return "Pool ứng viên còn nhỏ. Cân nhắc mở rộng kênh tuyển dụng.";
        if (score >= 75)
            return String.format("Có %d ứng viên cho %d vị trí. Dùng AI scoring để lọc nhanh.",
                    req.getTotalApplicants(), req.getHiringQuota());
        return String.format("Pool ổn định: %d ứng viên, điểm AI trung bình %.0f.",
                req.getTotalApplicants(), req.getAverageAIScore());
    }
}