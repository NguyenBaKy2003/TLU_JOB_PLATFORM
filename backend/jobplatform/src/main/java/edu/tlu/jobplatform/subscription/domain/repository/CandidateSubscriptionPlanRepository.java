package edu.tlu.jobplatform.subscription.domain.repository;

import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateSubscriptionPlanRepository {

    /** Chỉ trả về plan đang active — dùng cho public pricing page */
    List<CandidateSubscriptionPlan> findAllActive();

    /** Trả về tất cả — dùng cho admin */
    List<CandidateSubscriptionPlan> findAll();

    Optional<CandidateSubscriptionPlan> findById(UUID id);

    Optional<CandidateSubscriptionPlan> findByCode(String code);

    CandidateSubscriptionPlan save(CandidateSubscriptionPlan plan);
}