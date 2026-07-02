package com.kumbh.service;

import com.kumbh.entity.WeatherData;
import com.kumbh.entity.WeatherAlert;
import com.kumbh.entity.BroadcastNotification;
import java.util.List;

public interface WeatherService {
    // Weather Data
    WeatherData getLatestWeather();
    WeatherData updateWeatherData(WeatherData weatherData);
    
    // Weather Alerts
    List<WeatherAlert> getActiveAlerts();
    WeatherAlert createAlert(WeatherAlert alert);
    WeatherAlert updateAlert(Long id, WeatherAlert alertDetails);
    void deleteAlert(Long id);
    
    // Broadcast Notifications
    List<BroadcastNotification> getAllNotifications();
    BroadcastNotification createNotification(BroadcastNotification notification);
    void deleteNotification(Long id);
    
    // Automation
    // void fetchAndSaveWeatherData();
}