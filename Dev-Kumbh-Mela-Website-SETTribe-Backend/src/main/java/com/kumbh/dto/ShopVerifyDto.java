package com.kumbh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Operator DTO for approving, rejecting, or suspending a shop.
 */
public class ShopVerifyDto {

    /** APPROVED | REJECTED | SUSPENDED */
    @NotBlank(message = "Decision is required")
    private String decision;

    @Size(max = 500, message = "Remarks cannot exceed 500 characters")
    private String remarks;

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
