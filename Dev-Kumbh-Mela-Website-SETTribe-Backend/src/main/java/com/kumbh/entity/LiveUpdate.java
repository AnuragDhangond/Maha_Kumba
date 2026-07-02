package com.kumbh.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "live_updates")
public class LiveUpdate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category; // "LIVE_UPDATE" or "ESSENTIAL_SERVICE"
    private String externalLink; // For Essential Services navigation

    private String location;

    private String imagePath;

    private LocalTime startTime;

    private LocalTime endTime;

    private boolean isFeatured = false;

    public LiveUpdate() {
    }

    public LiveUpdate(Long id, String title, String description, String location, String imagePath,
            LocalTime startTime, LocalTime endTime, boolean isFeatured) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.location = location;
        this.imagePath = imagePath;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isFeatured = isFeatured;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getExternalLink() {
        return externalLink;
    }

    public void setExternalLink(String externalLink) {
        this.externalLink = externalLink;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public boolean isFeatured() {
        return isFeatured;
    }

    public void setFeatured(boolean featured) {
        isFeatured = featured;
    }
}
