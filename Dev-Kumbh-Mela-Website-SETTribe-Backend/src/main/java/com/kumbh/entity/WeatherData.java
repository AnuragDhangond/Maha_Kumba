package com.kumbh.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Table(name = "weather_data")
@Data
@EqualsAndHashCode(callSuper = true)
public class WeatherData extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double temperature;
    private Integer humidity;
    private Double windSpeed;
    @Column(name = "weather_condition")
    private String condition;
    private String icon;
    private String rainStatus;
    private Double uvIndex;
    private String airQuality;
    private String sunrise;
    private String sunset;
    
    @Column(name = "recorded_at")
    private LocalDateTime recordedAt = LocalDateTime.now();
}