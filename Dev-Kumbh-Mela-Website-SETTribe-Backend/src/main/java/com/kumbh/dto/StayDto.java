package com.kumbh.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public class StayDto {
    private Long id;

    @NotBlank(message = "Stay title is required")
    @Size(min = 5, max = 120, message = "Title must be between 5 and 120 characters")
    @Pattern(regexp = ".*[a-zA-Z0-9].*", message = "Title must contain at least one letter or number")
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Rating is required")
    @Pattern(regexp = "^([0-4](\\.\\d)?|5(\\.0)?)$", message = "Rating must be between 0.0 and 5.0 with max 1 decimal place")
    private String rating;

    private String imagePath;

    @NotBlank(message = "Price is required")
    @Pattern(regexp = "^([0-9]{1,5}|100000)$", message = "Price must be a number between 0 and 100,000")
    private String price;

    private List<String> features;
    private String navigationLink;
    private boolean removeImage;

    public StayDto() {
    }

    public StayDto(Long id, String title, String category, String rating, String imagePath, String price, List<String> features, String navigationLink) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.rating = rating;
        this.imagePath = imagePath;
        this.price = price;
        this.features = features;
        this.navigationLink = navigationLink;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getRating() { return rating; }
    public void setRating(String rating) { this.rating = rating; }
    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }
    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }
    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }
    public boolean isRemoveImage() { return removeImage; }
    public void setRemoveImage(boolean removeImage) { this.removeImage = removeImage; }
    public String getNavigationLink() { return navigationLink; }
    public void setNavigationLink(String navigationLink) { this.navigationLink = navigationLink; }
}
