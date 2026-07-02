package com.kumbh.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OperatorDashboardSummaryDto {

    private int activeSosCount;
    private int resolvedSosCount;
    private int hospitalBedsCount;
    private int activeHospitalCount;
    private int highCrowdZonesCount;
    private int liveUpdatesCount;
    private int essentialServicesCount;
    private String zoneStatusLabel;
    private LocalDateTime zoneStatusUpdatedAt;
    private LocalDateTime generatedAt;
    private List<EmergencyAlertDto> recentIncidents = new ArrayList<>();

    public int getActiveSosCount() {
        return activeSosCount;
    }

    public void setActiveSosCount(int activeSosCount) {
        this.activeSosCount = activeSosCount;
    }

    public int getResolvedSosCount() {
        return resolvedSosCount;
    }

    public void setResolvedSosCount(int resolvedSosCount) {
        this.resolvedSosCount = resolvedSosCount;
    }

    public int getHospitalBedsCount() {
        return hospitalBedsCount;
    }

    public void setHospitalBedsCount(int hospitalBedsCount) {
        this.hospitalBedsCount = hospitalBedsCount;
    }

    public int getActiveHospitalCount() {
        return activeHospitalCount;
    }

    public void setActiveHospitalCount(int activeHospitalCount) {
        this.activeHospitalCount = activeHospitalCount;
    }

    public int getHighCrowdZonesCount() {
        return highCrowdZonesCount;
    }

    public void setHighCrowdZonesCount(int highCrowdZonesCount) {
        this.highCrowdZonesCount = highCrowdZonesCount;
    }

    public int getLiveUpdatesCount() {
        return liveUpdatesCount;
    }

    public void setLiveUpdatesCount(int liveUpdatesCount) {
        this.liveUpdatesCount = liveUpdatesCount;
    }

    public int getEssentialServicesCount() {
        return essentialServicesCount;
    }

    public void setEssentialServicesCount(int essentialServicesCount) {
        this.essentialServicesCount = essentialServicesCount;
    }

    public String getZoneStatusLabel() {
        return zoneStatusLabel;
    }

    public void setZoneStatusLabel(String zoneStatusLabel) {
        this.zoneStatusLabel = zoneStatusLabel;
    }

    public LocalDateTime getZoneStatusUpdatedAt() {
        return zoneStatusUpdatedAt;
    }

    public void setZoneStatusUpdatedAt(LocalDateTime zoneStatusUpdatedAt) {
        this.zoneStatusUpdatedAt = zoneStatusUpdatedAt;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public List<EmergencyAlertDto> getRecentIncidents() {
        return recentIncidents;
    }

    public void setRecentIncidents(List<EmergencyAlertDto> recentIncidents) {
        this.recentIncidents = recentIncidents;
    }
}
