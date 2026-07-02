package com.kumbh.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "health_tips")
public class HealthTip extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "tip_text", nullable = false, columnDefinition = "TEXT")
    private String tipText;

    @Column(name = "image_path", columnDefinition = "TEXT")
    private String imagePath;

    public HealthTip() {
    }

    public HealthTip(Long id, String category, String tipText, String imagePath) {
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
