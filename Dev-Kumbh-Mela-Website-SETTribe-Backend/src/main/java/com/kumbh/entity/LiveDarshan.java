package com.kumbh.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "live_darshans")
public class LiveDarshan extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String location;

    private String viewers;

    private String imagePath;

    private String status; // For manual override if needed

    private LocalTime startTime;

    private LocalTime endTime;

    private String time; // Display time string (e.g. "06:30 PM")

    private String link;

    public LiveDarshan() {
    }

    public LiveDarshan(Long id, String title, String location, String viewers, String imagePath, String status, LocalTime startTime, LocalTime endTime, String time, String link) {
        this.id = id;
        this.title = title;
        this.location = location;
        this.viewers = viewers;
        this.imagePath = imagePath;
        this.status = status;
        this.startTime = startTime;
        this.endTime = endTime;
        this.time = time;
        this.link = link;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getViewers() {
        return viewers;
    }

    public void setViewers(String viewers) {
        this.viewers = viewers;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }
}
