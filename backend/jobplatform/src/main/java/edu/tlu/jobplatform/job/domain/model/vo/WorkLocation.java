package edu.tlu.jobplatform.job.domain.model.vo;

import lombok.Builder;
import lombok.Getter;

/**
 * Value Object: Địa điểm làm việc.
 *
 * type = REMOTE → không cần địa chỉ cụ thể
 * type = ONSITE → cần city + address
 * type = HYBRID → kết hợp
 */
@Getter
@Builder
public class WorkLocation {

    public enum Type {
        ONSITE, REMOTE, HYBRID
    }

    private final Type type;
    private final String city; // "Hà Nội", "TP. Hồ Chí Minh"
    private final String district; // Quận/huyện (optional)
    private final String address; // Địa chỉ đầy đủ (optional)

    public static WorkLocation remote() {
        return WorkLocation.builder().type(Type.REMOTE).build();
    }

    public static WorkLocation onsite(String city, String address) {
        return WorkLocation.builder()
                .type(Type.ONSITE).city(city).address(address).build();
    }

    public static WorkLocation hybrid(String city) {
        return WorkLocation.builder().type(Type.HYBRID).city(city).build();
    }

    public String display() {
        return switch (type) {
            case REMOTE -> "Remote";
            case HYBRID -> "Hybrid" + (city != null ? " – " + city : "");
            case ONSITE -> city != null ? city : "Xem thêm";
        };
    }
}