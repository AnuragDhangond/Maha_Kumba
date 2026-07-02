package com.kumbh.dto;

import java.time.LocalDateTime;

public class EmergencyAlertDto {

    private Long id;
    private String alertId;
    private Double latitude;
    private Double longitude;
    private String emergencyType;
    private String status = "Pending";
    private String priority;
    private LocalDateTime reportedTime = LocalDateTime.now();
    private String acceptedBy;
    private String resolvedBy;
    private LocalDateTime resolvedTime;

    public EmergencyAlertDto() {}

    public EmergencyAlertDto(Long id, String alertId, Double latitude, Double longitude, String emergencyType, String status, String priority, LocalDateTime reportedTime, String acceptedBy, LocalDateTime resolvedTime) {
        this.id = id;
        this.alertId = alertId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.emergencyType = emergencyType;
        this.status = status;
        this.priority = priority;
        this.reportedTime = reportedTime;
        this.acceptedBy = acceptedBy;
        this.resolvedTime = resolvedTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAlertId() {
        return alertId;
    }

    public void setAlertId(String alertId) {
        this.alertId = alertId;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getEmergencyType() {
        return emergencyType;
    }

    public void setEmergencyType(String emergencyType) {
        this.emergencyType = emergencyType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDateTime getReportedTime() {
        return reportedTime;
    }

    public void setReportedTime(LocalDateTime reportedTime) {
        this.reportedTime = reportedTime;
    }

    public String getAcceptedBy() {
        return acceptedBy;
    }

    public void setAcceptedBy(String acceptedBy) {
        this.acceptedBy = acceptedBy;
    }

    public String getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public LocalDateTime getResolvedTime() {
        return resolvedTime;
    }

    public void setResolvedTime(LocalDateTime resolvedTime) {
        this.resolvedTime = resolvedTime;
    }
}
