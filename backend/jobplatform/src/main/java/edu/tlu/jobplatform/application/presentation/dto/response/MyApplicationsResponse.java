package edu.tlu.jobplatform.application.presentation.dto.response;

import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.shared.response.PageResponse;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class MyApplicationsResponse {

    private PageResponse<ApplicationResponse> applications;

    /**
     * Số lượng đơn theo từng trạng thái — chỉ chứa các status có ít nhất 1 đơn.
     * VD: { "SUBMITTED": 3, "REVIEWING": 1, "REJECTED": 2 }
     */
    private Map<ApplicationStatus, Long> statusCounts;

    /** Tổng số đơn (mọi trạng thái) */
    private long totalApplications;
}