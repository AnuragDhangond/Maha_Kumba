package com.kumbh.dto;

import java.time.LocalDateTime;

public class CrowdStatusDto {
    private Long id;
    private String locationName;
    private String locationType;
    private Double latitude;
    private Double longitude;
    private CrowdLevel crowdLevel;
    private LocalDateTime lastUpdated;
    private Integer currentVisitorCount;
    private Boolean manualOverride;

    public CrowdStatusDto() {}

    public CrowdStatusDto(Long id, String locationName, String locationType, Double latitude, Double longitude, CrowdLevel crowdLevel, LocalDateTime lastUpdated, Integer currentVisitorCount, Boolean manualOverride) {
        this.id = id;
        this.locationName = locationName;
        this.locationType = locationType;
        this.latitude = latitude;
        this.longitude = longitude;
        this.crowdLevel = crowdLevel;
        this.lastUpdated = lastUpdated;
        this.currentVisitorCount = currentVisitorCount;
        this.manualOverride = manualOverride;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public String getLocationType() {
        return locationType;
    }

    public void setLocationType(String locationType) {
        this.locationType = locationType;
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

    public CrowdLevel getCrowdLevel() {
        return crowdLevel;
    }

    public void setCrowdLevel(CrowdLevel crowdLevel) {
        this.crowdLevel = crowdLevel;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public Integer getCurrentVisitorCount() {
        return currentVisitorCount;
    }

    public void setCurrentVisitorCount(Integer currentVisitorCount) {
        this.currentVisitorCount = currentVisitorCount;
    }

    public Boolean getManualOverride() {
        return manualOverride;
    }

    public void setManualOverride(Boolean manualOverride) {
        this.manualOverride = manualOverride;
    }

    public enum CrowdLevel {
        GREEN, YELLOW, RED
    }
}