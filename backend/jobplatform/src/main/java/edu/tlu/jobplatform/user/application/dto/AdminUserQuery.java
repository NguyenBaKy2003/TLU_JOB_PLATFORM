package edu.tlu.jobplatform.user.application.dto;

import edu.tlu.jobplatform.user.domain.model.UserRole;
import lombok.Data;

@Data
public class AdminUserQuery {
    private String keyword; // tìm theo fullName / email
    private UserRole role; // null = tất cả role
    private Boolean active; // null = tất cả, true/false = lọc theo trạng thái
    private int page = 0;
    private int size = 20;
    private String sortBy = "createdAt";
    private String sortDir = "desc";
}