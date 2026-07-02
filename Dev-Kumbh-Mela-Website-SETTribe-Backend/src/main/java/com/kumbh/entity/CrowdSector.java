package com.kumbh.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.locationtech.jts.geom.Polygon;
import java.time.LocalDateTime;

@Entity
@Table(name = "crowd_sectors")
public class CrowdSector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @Convert(converter = PolygonConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private Polygon boundary;

    @com.fasterxml.jackson.annotation.JsonProperty("boundary")
    public java.util.Map<String, Object> getBoundaryData() {
        if (boundary == null) return null;
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("type", "Polygon");
        java.util.List<java.util.List<double[]>> coordinates = new java.util.ArrayList<>();
        java.util.List<double[]> ring = new java.util.ArrayList<>();
        for (org.locationtech.jts.geom.Coordinate coord : boundary.getCoordinates()) {
            ring.add(new double[]{coord.x, coord.y});
        }
        coordinates.add(ring);
        data.put("coordinates", coordinates);
        return data;
    }

    private Double centerLat;
    private Double centerLng;

    private Integer currentDensity = 0;

    @Enumerated(EnumType.STRING)
    private CrowdStatus.CrowdLevel status = CrowdStatus.CrowdLevel.GREEN;

    private LocalDateTime lastUpdated;

    public CrowdSector() {
        this.lastUpdated = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Polygon getBoundary() { return boundary; }
    public void setBoundary(Polygon boundary) { this.boundary = boundary; }

    public Double getCenterLat() { return centerLat; }
    public void setCenterLat(Double centerLat) { this.centerLat = centerLat; }

    public Double getCenterLng() { return centerLng; }
    public void setCenterLng(Double centerLng) { this.centerLng = centerLng; }

    public Integer getCurrentDensity() { return currentDensity; }
    public void setCurrentDensity(Integer currentDensity) { this.currentDensity = currentDensity; }

    public CrowdStatus.CrowdLevel getStatus() { return status; }
    public void setStatus(CrowdStatus.CrowdLevel status) { this.status = status; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
