package com.kumbh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class AcharyaDTO {
    private Long id;

    @NotBlank(message = "Name is mandatory")
    private String name;

    @NotBlank(message = "Specialty is mandatory")
    private String specialty;
    private String experience;
    private Double rating;
    private Integer reviews;
    private String imagePath;
    private String location;
    private List<PoojaItemDTO> poojas;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String createdAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String updatedAt;

    public AcharyaDTO() {}

    public AcharyaDTO(Long id, String name, String specialty, String experience, Double rating, Integer reviews, String imagePath, String location, List<PoojaItemDTO> poojas, String createdAt, String updatedAt) {
        this.id = id;
        this.name = name;
        this.specialty = specialty;
        this.experience = experience;
        this.rating = rating;
        this.reviews = reviews;
        this.imagePath = imagePath;
        this.location = location;
        this.poojas = poojas;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Manual Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviews() { return reviews; }
    public void setReviews(Integer reviews) { this.reviews = reviews; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public List<PoojaItemDTO> getPoojas() { return poojas; }
    public void setPoojas(List<PoojaItemDTO> poojas) { this.poojas = poojas; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
