package edu.tlu.jobplatform.subscription.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CandidatePurchaseRequest(
                @NotNull UUID planId,
                boolean yearly,
                String gateway // "VNPAY" | "MOMO" | "ZALOPAY" — null → default VNPAY
) {
}