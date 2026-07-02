package com.kumbh.service.impl;

import com.kumbh.entity.WeatherData;
import com.kumbh.entity.WeatherAlert;
import com.kumbh.entity.BroadcastNotification;
import com.kumbh.repository.WeatherDataRepository;
import com.kumbh.repository.WeatherAlertRepository;
import com.kumbh.repository.BroadcastNotificationRepository;
import com.kumbh.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.util.List;
import java.util.Random;

@Service
public class WeatherServiceImpl implements WeatherService {

    @Autowired
    private WeatherDataRepository weatherDataRepository;

    @Autowired
    private WeatherAlertRepository weatherAlertRepository;

    @Autowired
    private BroadcastNotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private void broadcastAlerts() {
        messagingTemplate.convertAndSend("/topic/weather-alerts", getActiveAlerts());
    }

    private void broadcastNotifications() {
        messagingTemplate.convertAndSend("/topic/weather-notifications", getAllNotifications());
    }

    private void broadcastWeather(WeatherData data) {
        messagingTemplate.convertAndSend("/topic/weather-updates", data);
    }

    @Override
    public WeatherData getLatestWeather() {
        return weatherDataRepository.findFirstByOrderByRecordedAtDesc()
                .orElse(null);
    }

    @Override
    public WeatherData updateWeatherData(WeatherData weatherData) {
        WeatherData saved = weatherDataRepository.save(weatherData);
        broadcastWeather(saved);
        return saved;
    }

    @Override
    public List<WeatherAlert> getActiveAlerts() {
        return weatherAlertRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    @Override
    public WeatherAlert createAlert(WeatherAlert alert) {
        WeatherAlert saved = weatherAlertRepository.save(alert);
        broadcastAlerts();
        return saved;
    }

    @Override
    public WeatherAlert updateAlert(Long id, WeatherAlert alertDetails) {
        WeatherAlert alert = weatherAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setType(alertDetails.getType());
        alert.setMessage(alertDetails.getMessage());
        alert.setSeverity(alertDetails.getSeverity());
        alert.setIsActive(alertDetails.getIsActive());
        WeatherAlert saved = weatherAlertRepository.save(alert);
        broadcastAlerts();
        return saved;
    }

    @Override
    public void deleteAlert(Long id) {
        weatherAlertRepository.deleteById(id);
        broadcastAlerts();
    }

    @Override
    public List<BroadcastNotification> getAllNotifications() {
        return notificationRepository.findByIsDeletedFalseOrderByCreatedAtDesc();
    }

    @Override
    public BroadcastNotification createNotification(BroadcastNotification notification) {
        BroadcastNotification saved = notificationRepository.save(notification);
        broadcastNotifications();
        return saved;
    }

    @Override
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
        broadcastNotifications();
    }

    /* 
     * Disabled: We now use real-time data from Open-Meteo on the frontend.
     * The mock generator below is no longer needed.
     */
    // @Override
    // @Scheduled(fixedRate = 1800000) // Every 30 minutes
    // public void fetchAndSaveWeatherData() {
    //     WeatherData mockData = generateMockWeatherData();
    //     WeatherData saved = weatherDataRepository.save(mockData);
    //     broadcastWeather(saved);
    // }

    // private WeatherData generateMockWeatherData() {
    //     Random random = new Random();
    //     WeatherData data = new WeatherData();
    //     data.setTemperature(25.0 + random.nextDouble() * 10);
    //     data.setHumidity(40 + random.nextInt(40));
    //     data.setWindSpeed(5.0 + random.nextDouble() * 15);
    //     data.setCondition("Partly Cloudy");
    //     data.setIcon("02d");
    //     data.setRainStatus("No Rain");
    //     data.setUvIndex(5.5 + random.nextDouble() * 5);
    //     data.setAirQuality("Moderate");
    //     data.setSunrise("05:45 AM");
    //     data.setSunset("06:30 PM");
    //     return data;
    // }
}