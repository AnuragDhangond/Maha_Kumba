package com.kumbh.entity;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.persistence.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "stays")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Stay extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StayCategory category;

    @Min(value = 0, message = "Rating must be at least 0")
    @Max(value = 5, message = "Rating must be at most 5")
    @Column(nullable = false)
    private Double rating;

    private String imagePath;

    @Column(nullable = false)
    private Long price; // Store in paise/cents as per best practice

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "stay_features", joinColumns = @JoinColumn(name = "stay_id"))
    @Column(name = "feature")
    private List<String> features = new java.util.ArrayList<>();

    @Column(name = "navigation_link", columnDefinition = "TEXT")
    private String navigationLink;

    @Transient
    private boolean removeImage;

    public Stay() {
    }

    public Stay(Long id, String title, StayCategory category, Double rating, String imagePath, Long price, List<String> features, String navigationLink) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.rating = rating;
        this.imagePath = imagePath;
        this.price = price;
        this.features = features;
        this.navigationLink = navigationLink;
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

    public StayCategory getCategory() {
        return category;
    }

    public void setCategory(StayCategory category) {
        this.category = category;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public Long getPrice() {
        return price;
    }

    public void setPrice(Long price) {
        this.price = price;
    }

    public List<String> getFeatures() {
        return features;
    }

    public void setFeatures(List<String> features) {
        this.features = features;
    }

    public boolean isRemoveImage() {
        return removeImage;
    }

    public void setRemoveImage(boolean removeImage) {
        this.removeImage = removeImage;
    }

    public String getNavigationLink() {
        return navigationLink;
    }

    public void setNavigationLink(String navigationLink) {
        this.navigationLink = navigationLink;
    }
}
