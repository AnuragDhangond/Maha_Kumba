package com.kumbh.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "crowd_status")
public class CrowdStatus extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String locationName;

    private String locationType;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CrowdLevel crowdLevel;

    private Integer currentVisitorCount = 0;

    private Boolean manualOverride = false;

    // Default Constructor
    public CrowdStatus() {
    }

    // Parameterized Constructor
    public CrowdStatus(Long id,
                       String locationName,
                       String locationType,
                       Double latitude,
                       Double longitude,
                       CrowdLevel crowdLevel,
                       Integer currentVisitorCount) {

        this.id = id;
        this.locationName = locationName;
        this.locationType = locationType;
        this.latitude = latitude;
        this.longitude = longitude;
        this.crowdLevel = crowdLevel;
        this.currentVisitorCount = currentVisitorCount;
        this.manualOverride = false;
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
        GREEN,
        YELLOW,
        RED
    }
}