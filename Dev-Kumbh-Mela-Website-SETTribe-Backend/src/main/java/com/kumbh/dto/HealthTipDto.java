package com.kumbh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class HealthTipDto {
    private Long id;

    @NotBlank(message = "Category is required")
    @Size(min = 2, max = 50, message = "Category must be between 2 and 50 characters")
    private String category;

    @NotBlank(message = "Tip text is required")
    @Size(min = 5, max = 1000, message = "Tip text must be between 5 and 1000 characters")
    private String tipText;
    private String imagePath;

    public HealthTipDto() {
    }

    public HealthTipDto(Long id, String category, String tipText, String imagePath) {
        this.id = id;
        this.category = category;
        this.tipText = tipText;
        this.imagePath = imagePath;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getTipText() { return tipText; }
    public void setTipText(String tipText) { this.tipText = tipText; }
    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }
}
