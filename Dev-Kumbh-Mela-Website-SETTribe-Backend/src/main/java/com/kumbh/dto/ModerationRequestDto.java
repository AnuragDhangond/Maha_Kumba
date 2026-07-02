package com.kumbh.dto;

public class ModerationRequestDto {
    private String status; // APPROVED, REJECTED, BLOCKED, CHANGES_REQUESTED
    private String remarks;
    private String rejectionReason;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
