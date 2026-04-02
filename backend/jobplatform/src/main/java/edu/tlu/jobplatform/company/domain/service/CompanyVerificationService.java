package edu.tlu.jobplatform.company.domain.service;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import org.springframework.stereotype.Service;

/**
 * Domain Service chứa business rules phức tạp về xác thực công ty.
 *
 * Tại sao cần Domain Service thay vì đặt logic trong UseCase?
 * Logic này liên quan thuần túy đến business rule của domain,
 * không phụ thuộc vào infrastructure (DB, HTTP, Redis...).
 * Nhiều UseCase có thể tái dùng service này.
 */
@Service
public class CompanyVerificationService {

    /**
     * Kiểm tra công ty đủ điều kiện để gửi xác thực không.
     *
     * Business Rules:
     * BR-01: Phải có tên công ty
     * BR-02: Phải có mô tả (ít nhất 50 ký tự)
     * BR-03: Phải có địa chỉ
     * BR-04: Phải có email liên hệ
     * BR-05: Không được submit khi đang VERIFIED hoặc đang chờ (UNVERIFIED)
     */
    public void validateForVerification(CompanyProfile company) {

        if (company.getName() == null || company.getName().isBlank())
            throw new BusinessRuleException(
                    "Vui lòng nhập tên công ty trước khi gửi xác thực.",
                    "COMPANY_NAME_REQUIRED");

        if (company.getDescription() == null || company.getDescription().length() < 50)
            throw new BusinessRuleException(
                    "Mô tả công ty phải có ít nhất 50 ký tự.",
                    "COMPANY_DESCRIPTION_TOO_SHORT");

        if (company.getAddress() == null || company.getAddress().isBlank())
            throw new BusinessRuleException(
                    "Vui lòng nhập địa chỉ công ty.",
                    "COMPANY_ADDRESS_REQUIRED");

        if (company.getEmail() == null || company.getEmail().isBlank())
            throw new BusinessRuleException(
                    "Vui lòng nhập email liên hệ của công ty.",
                    "COMPANY_EMAIL_REQUIRED");

        if (company.getVerificationStatus() == VerificationStatus.VERIFIED)
            throw new BusinessRuleException(
                    "Công ty đã được xác thực.",
                    "COMPANY_ALREADY_VERIFIED");
    }

    /**
     * Kiểm tra admin có thể duyệt xác thực không.
     * Admin không thể duyệt công ty đã VERIFIED hoặc SUSPENDED.
     */
    public void validateForApproval(CompanyProfile company) {
        if (company.getVerificationStatus() == VerificationStatus.VERIFIED)
            throw new BusinessRuleException(
                    "Công ty này đã được xác thực rồi.",
                    "COMPANY_ALREADY_VERIFIED");

        if (company.getVerificationStatus() == VerificationStatus.SUSPENDED)
            throw new BusinessRuleException(
                    "Không thể duyệt công ty đang bị khoá. Hãy bỏ khoá trước.",
                    "COMPANY_SUSPENDED");
    }

    /**
     * Kiểm tra lý do từ chối hợp lệ.
     */
    public void validateRejectionReason(String reason) {
        if (reason == null || reason.isBlank())
            throw new BusinessRuleException(
                    "Vui lòng nhập lý do từ chối.",
                    "REJECTION_REASON_REQUIRED");

        if (reason.length() < 10)
            throw new BusinessRuleException(
                    "Lý do từ chối phải có ít nhất 10 ký tự.",
                    "REJECTION_REASON_TOO_SHORT");
    }
}