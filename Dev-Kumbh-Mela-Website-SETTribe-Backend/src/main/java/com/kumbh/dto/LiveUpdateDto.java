package com.kumbh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import java.time.LocalTime;
import java.time.LocalDateTime;

public class LiveUpdateDto {

    private Long id;

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
    @Pattern(regexp = ".*[a-zA-Z].*", message = "Title must contain at least one letter")
    @Pattern(regexp = "^[^<>]*$", message = "HTML tags are not allowed in title")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    @Pattern(regexp = "^[^<>]*$", message = "HTML tags are not allowed in description")
    private String description;

    @NotBlank(message = "Location is required")
    @Size(min = 3, max = 150, message = "Location must be between 3 and 150 characters")
    @Pattern(regexp = "^[a-zA-Z0-9, ]+$", message = "Location can only contain letters, numbers, commas, and spaces")
    @Pattern(regexp = ".*[a-zA-Z].*", message = "Location must contain at least one letter")
    private String location;
    
    private String imagePath;
    
    private LocalTime startTime;
    
    private LocalTime endTime;
    
    private boolean isFeatured;
    
    private String category;
    
    @Size(max = 500, message = "External link must not exceed 500 characters")
    @Pattern(regexp = "^(https?://.*|/.*)?$", message = "External link must be a valid URL (http/https) or a relative path starting with /")
    @Pattern(regexp = "^(?!.*javascript:).*$", message = "JavaScript URLs are not allowed")
    private String externalLink;

    // Getters and Setters

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
        this.title = title != null ? title.trim() : null;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description != null ? description.trim() : null;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location != null ? location.trim().replaceAll(" +", " ") : null;
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
}
