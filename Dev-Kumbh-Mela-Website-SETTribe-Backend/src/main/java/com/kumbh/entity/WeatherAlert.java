package com.kumbh.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "weather_alerts")
@Data
@EqualsAndHashCode(callSuper = true)
public class WeatherAlert extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // e.g., Heavy Rain, Thunderstorm, Heatwave
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private String severity; // Low, Medium, High, Critical
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "alert_threshold")
    private Double threshold; // Optional: value that triggered the alert
}