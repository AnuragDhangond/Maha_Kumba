package com.kumbh.controller;

import com.kumbh.entity.WeatherData;
import com.kumbh.entity.WeatherAlert;
import com.kumbh.entity.BroadcastNotification;
import com.kumbh.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    // Public endpoints for pilgrims
    @GetMapping("/current")
    public ResponseEntity<WeatherData> getLatestWeather() {
        return ResponseEntity.ok(weatherService.getLatestWeather());
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<WeatherAlert>> getActiveAlerts() {
        return ResponseEntity.ok(weatherService.getActiveAlerts());
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<BroadcastNotification>> getAllNotifications() {
        return ResponseEntity.ok(weatherService.getAllNotifications());
    }

    // Admin endpoints
    @PostMapping("/alerts")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OPERATOR', 'ROLE_ADMIN', 'ROLE_OPERATOR')")
    public ResponseEntity<WeatherAlert> createAlert(@RequestBody WeatherAlert alert) {
        return ResponseEntity.ok(weatherService.createAlert(alert));
    }

    @PutMapping("/alerts/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OPERATOR', 'ROLE_ADMIN', 'ROLE_OPERATOR')")
    public ResponseEntity<WeatherAlert> updateAlert(@PathVariable Long id, @RequestBody WeatherAlert alert) {
        return ResponseEntity.ok(weatherService.updateAlert(id, alert));
    }

    @DeleteMapping("/alerts/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OPERATOR', 'ROLE_ADMIN', 'ROLE_OPERATOR')")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        weatherService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/notifications")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OPERATOR', 'ROLE_ADMIN', 'ROLE_OPERATOR')")
    public ResponseEntity<BroadcastNotification> createNotification(@RequestBody BroadcastNotification notification) {
        return ResponseEntity.ok(weatherService.createNotification(notification));
    }

    @PostMapping("/current")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OPERATOR', 'ROLE_ADMIN', 'ROLE_OPERATOR')")
    public ResponseEntity<WeatherData> createWeatherData(@RequestBody WeatherData weatherData) {
        return ResponseEntity.ok(weatherService.updateWeatherData(weatherData));
    }

    @PutMapping("/current")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OPERATOR', 'ROLE_ADMIN', 'ROLE_OPERATOR')")
    public ResponseEntity<WeatherData> updateWeatherData(@RequestBody WeatherData weatherData) {
        return ResponseEntity.ok(weatherService.updateWeatherData(weatherData));
    }

    @DeleteMapping("/notifications/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        weatherService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}