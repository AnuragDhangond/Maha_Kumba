package com.kumbh.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "saints_directory")
public class SaintDirectory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String akhada;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String role;

    @Column(length = 500)
    private String image;

    private Integer displayOrder = 0;

    @Column(nullable = false, length = 50)
    private String status = "ACTIVE";

    public SaintDirectory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAkhada() { return akhada; }
    public void setAkhada(String akhada) { this.akhada = akhada; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
