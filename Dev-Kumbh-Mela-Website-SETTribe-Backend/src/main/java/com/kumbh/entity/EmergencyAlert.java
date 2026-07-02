package com.kumbh.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_alerts")
public class EmergencyAlert extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alert_id", unique = true, nullable = false)
    private String alertId;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "emergency_type", nullable = false)
    private String emergencyType;

    @Column(nullable = false)
    private String status = "Pending"; // 'Pending', 'Accepted', 'Resolved'

    @Column(nullable = false)
    private String priority; // 'Low', 'Medium', 'High', 'Critical'

    @Column(name = "accepted_by")
    private String acceptedBy;

    @Column(name = "resolved_by")
    private String resolvedBy;

    @Column(name = "resolved_time")
    private LocalDateTime resolvedTime;

    public EmergencyAlert() {
    }

    public EmergencyAlert(Long id, String alertId, Double latitude, Double longitude, String emergencyType,
            String status, String priority, String acceptedBy, LocalDateTime resolvedTime) {
        this.id = id;
        this.alertId = alertId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.emergencyType = emergencyType;
        this.status = status;
        this.priority = priority;
        this.acceptedBy = acceptedBy;
        this.resolvedTime = resolvedTime;
    }

    // Getters and Setters
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
