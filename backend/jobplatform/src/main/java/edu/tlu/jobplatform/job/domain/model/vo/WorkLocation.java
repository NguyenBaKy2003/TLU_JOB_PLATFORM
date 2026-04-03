package edu.tlu.jobplatform.job.domain.model.vo;

import lombok.Builder;
import lombok.Getter;

/**
 * Value Object mô tả hình thức và địa điểm làm việc.
 */
@Getter
@Builder
public class WorkLocation {

    private final LocationType type; // ONSITE, REMOTE, HYBRID
    private final String city;
    private final String address;

    public static WorkLocation remote() {
        return WorkLocation.builder().type(LocationType.REMOTE).build();
    }

    public static WorkLocation onsite(String city, String address) {
        return WorkLocation.builder()
                .type(LocationType.ONSITE).city(city).address(address).build();
    }

    public static WorkLocation hybrid(String city) {
        return WorkLocation.builder().type(LocationType.HYBRID).city(city).build();
    }

    public enum LocationType {
        ONSITE, // Làm tại văn phòng
        REMOTE, // Làm từ xa
        HYBRID // Kết hợp
    }
}