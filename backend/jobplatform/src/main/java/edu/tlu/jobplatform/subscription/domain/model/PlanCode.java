package edu.tlu.jobplatform.subscription.domain.model;

/**
 * Constants cho plan code — dùng chung toàn hệ thống.
 */
public final class PlanCode {

    private PlanCode() {
    }

    // ── Company plans ─────────────────────────────────────────────────
    public static final String FREE_COMPANY = "FREE_COMPANY";
    public static final String STARTER = "STARTER";
    public static final String BUSINESS = "BUSINESS";
    public static final String ENTERPRISE = "ENTERPRISE";

    // ── Candidate plans ───────────────────────────────────────────────
    public static final String FREE_CANDIDATE = "FREE_CANDIDATE";
    public static final String PRO = "PRO";
    public static final String PREMIUM = "PREMIUM";
}