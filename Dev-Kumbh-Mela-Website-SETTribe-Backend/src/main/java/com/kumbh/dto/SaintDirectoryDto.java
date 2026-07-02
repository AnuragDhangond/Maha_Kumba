package com.kumbh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

public class SaintDirectoryDto {
    private Long id;

    @NotBlank(message = "Saint name is required")
    @Size(min = 2, max = 100, message = "Saint name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Akhada is required")
    private String akhada;

    @NotBlank(message = "Biography is required")
    @Size(min = 10, max = 2000, message = "Biography must be between 10 and 2000 characters")
    private String description;

    @NotBlank(message = "Role is required")
    private String role;
    private String image;

    @NotNull(message = "Display order is required")
    @Min(value = 0, message = "Display order must be a non-negative integer")
    private Integer displayOrder;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "ACTIVE|INACTIVE", message = "Status must be ACTIVE or INACTIVE")
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
