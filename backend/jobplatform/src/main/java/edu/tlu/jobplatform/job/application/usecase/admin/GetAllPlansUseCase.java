package edu.tlu.jobplatform.job.application.usecase.admin;

import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Use Case: Lấy TẤT CẢ subscription plans, bao gồm cả inactive.
 *
 * Dành riêng cho Admin. Khác với GetAvailablePlansUseCase (chỉ trả về
 * active plans cho trang pricing công khai).
 *
 * FIX: Tách ra usecase riêng thay vì thêm param vào GetAvailablePlansUseCase
 * để giữ nguyên behaviour của public endpoint.
 */
@Service
@RequiredArgsConstructor
public class GetAllPlansUseCase {

    private final SubscriptionPlanRepository planRepository;

    public List<SubscriptionPlan> execute() {
        // findAll() returns active + inactive; implement in repository if not already
        // present
        return planRepository.findAll();
    }
}