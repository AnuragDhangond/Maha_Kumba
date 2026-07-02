package com.kumbh.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "acharya_poojas")
public class PoojaItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    private String duration;

    @Column(name = "acharya_id", nullable = false)
    private Long acharyaId;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    public PoojaItem() {}

    public PoojaItem(Long id, String name, Double price, String duration, Long acharyaId) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.duration = duration;
        this.acharyaId = acharyaId;
        this.isActive = true;
    }

    // Manual Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public Long getAcharyaId() { return acharyaId; }
    public void setAcharyaId(Long acharyaId) { this.acharyaId = acharyaId; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
