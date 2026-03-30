package edu.tlu.jobplatform.company.domain.model;

/**
 * Quy mô nhân sự của công ty.
 * Dùng cho filter tìm kiếm và hiển thị trên UI.
 */
public enum CompanySize {

    STARTUP("1 - 10"),
    SMALL("11 - 50"),
    MEDIUM("51 - 200"),
    LARGE("201 - 500"),
    ENTERPRISE("500 - 1000"),
    CORPORATION("1000+");

    private final String label;

    CompanySize(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}