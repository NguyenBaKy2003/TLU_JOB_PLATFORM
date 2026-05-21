package edu.tlu.jobplatform.subscription.infrastructure.persistence.repository;

import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.CandidateSubscriptionPlanJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateSubscriptionPlanJpaRepo
        extends JpaRepository<CandidateSubscriptionPlanJpaEntity, UUID> {

    Optional<CandidateSubscriptionPlanJpaEntity> findByCode(String code);

    /** Public pricing page — chỉ lấy active, sắp xếp theo giá tăng dần */
    List<CandidateSubscriptionPlanJpaEntity> findByIsActiveTrueOrderByPriceMonthlyAsc();

    /** Tìm gói miễn phí để auto-assign khi candidate đăng ký mới */
    Optional<CandidateSubscriptionPlanJpaEntity> findByFreeTrue();
}