package com.kumbh.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import com.kumbh.validation.FutureOrPresentDate;

public class PoojaScheduleDTO {
    private Long id;

    @NotBlank(message = "Day of Week is required")
    private String day;

    public PoojaScheduleDTO() {}

    public PoojaScheduleDTO(Long id, String day, String deity, String specialPooja, String icon, String time, String startTime, String endTime, String place, String description, String createdAt, String updatedAt) {
        this.id = id;
        this.day = day;
        this.deity = deity;
        this.specialPooja = specialPooja;
        this.icon = icon;
        this.time = time;
        this.startTime = startTime;
        this.endTime = endTime;
        this.place = place;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    @NotBlank(message = "Presiding Deity is required")
    private String deity;

    public String getDeity() {
        return deity;
    }

    public void setDeity(String deity) {
        this.deity = deity;
    }

    @NotBlank(message = "Special Pooja / Ritual is required")
    private String specialPooja;

    public String getSpecialPooja() {
        return specialPooja;
    }

    public void setSpecialPooja(String specialPooja) {
        this.specialPooja = specialPooja;
    }

    private String icon;

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    private String time;

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    @NotBlank(message = "Date is required")
    @FutureOrPresentDate(message = "Previous dates are not allowed")
    private String startTime;

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    private String endTime;

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    private String place;

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place;
    }

    private String description;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String createdAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String updatedAt;

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
