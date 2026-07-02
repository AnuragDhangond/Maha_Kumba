package com.kumbh.service;

import com.kumbh.dto.CrowdStatsDto;
import com.kumbh.entity.CrowdStatus;
import com.kumbh.entity.UserPing;
import com.kumbh.repository.CrowdStatusRepository;
import com.kumbh.repository.UserPingRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CrowdAnalyticsService {

    @Autowired
    private UserPingRepository userPingRepository;

    @Autowired
    private CrowdStatusRepository crowdStatusRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostConstruct
    public void seedInitialLocations() {

        if (crowdStatusRepository.count() == 0) {

            crowdStatusRepository.save(
                    new CrowdStatus(null, "Ramkund Ghat", "Ghat",
                            20.0051, 73.7896,
                            CrowdStatus.CrowdLevel.GREEN, 0));

            crowdStatusRepository.save(
                    new CrowdStatus(null, "Kalaram Temple", "Temple",
                            20.0069, 73.7915,
                            CrowdStatus.CrowdLevel.GREEN, 0));

            crowdStatusRepository.save(
                    new CrowdStatus(null, "Tapovan Area", "Park",
                            20.0069, 73.8166,
                            CrowdStatus.CrowdLevel.GREEN, 0));

            crowdStatusRepository.save(
                    new CrowdStatus(null, "Panchvati Banks", "Ghat",
                            20.0080, 73.7900,
                            CrowdStatus.CrowdLevel.GREEN, 0));

            crowdStatusRepository.save(
                    new CrowdStatus(null, "Trimbakeshwar Temple", "Temple",
                            19.9324, 73.5308,
                            CrowdStatus.CrowdLevel.GREEN, 0));

        } else {

            List<CrowdStatus> locations = crowdStatusRepository.findAll();

            locations.forEach(location -> {
                location.setCrowdLevel(CrowdStatus.CrowdLevel.GREEN);
                location.setCurrentVisitorCount(0);
                location.setManualOverride(false);
            });

            crowdStatusRepository.saveAll(locations);
        }

        userPingRepository.deleteAll();
    }

    public CrowdStatsDto getCrowdStats() {

        long totalUsers = userPingRepository.count();

        List<CrowdStatus> locations = crowdStatusRepository.findAll();

        long highDensity = locations.stream()
                .filter(l -> l.getCrowdLevel() == CrowdStatus.CrowdLevel.RED)
                .count();

        int avgPilgrims = locations.isEmpty()
                ? 0
                : (int) Math.round(
                locations.stream()
                        .mapToInt(l -> l.getCurrentVisitorCount() == null
                                ? 0
                                : l.getCurrentVisitorCount())
                        .average()
                        .orElse(0));

        return new CrowdStatsDto(totalUsers, highDensity, avgPilgrims);
    }

    private void broadcastStats() {
        messagingTemplate.convertAndSend("/topic/crowd-stats", getCrowdStats());
    }

    @Transactional
    public void processUserPing(String deviceId,
                                Double latitude,
                                Double longitude) {

        UserPing ping = userPingRepository
                .findByDeviceId(deviceId)
                .orElse(new UserPing());

        ping.setDeviceId(deviceId);
        ping.setLatitude(latitude);
        ping.setLongitude(longitude);
        ping.setTimestamp(LocalDateTime.now());

        userPingRepository.save(ping);

        messagingTemplate.convertAndSend("/topic/live-traffic", ping);

        broadcastStats();
    }

    @Transactional
    public void removeUserPing(String deviceId) {

        userPingRepository.deleteByDeviceId(deviceId);

        messagingTemplate.convertAndSend(
                "/topic/live-traffic-remove",
                deviceId);

        broadcastStats();
    }

    @Scheduled(fixedRate = 120000)
    @Transactional
    public void updateLiveCrowdDensity() {

        LocalDateTime threeMinutesAgo =
                LocalDateTime.now().minusMinutes(3);

        userPingRepository.deleteByTimestampBefore(threeMinutesAgo);

        List<UserPing> activePings =
                userPingRepository.findAll();

        List<CrowdStatus> locations =
                crowdStatusRepository.findAll();

        for (CrowdStatus location : locations) {

            long count = activePings.stream()
                    .filter(ping ->
                            calculateDistance(
                                    location.getLatitude(),
                                    location.getLongitude(),
                                    ping.getLatitude(),
                                    ping.getLongitude()) < 1.0)
                    .count();

            location.setCurrentVisitorCount((int) count);

            if (location.getManualOverride() == null
                    || !location.getManualOverride()) {

                if (count >= 3) {
                    location.setCrowdLevel(
                            CrowdStatus.CrowdLevel.RED);
                } else if (count >= 2) {
                    location.setCrowdLevel(
                            CrowdStatus.CrowdLevel.YELLOW);
                } else {
                    location.setCrowdLevel(
                            CrowdStatus.CrowdLevel.GREEN);
                }
            }

            crowdStatusRepository.save(location);

            messagingTemplate.convertAndSend(
                    "/topic/crowd-updates",
                    location);
        }

        broadcastStats();
    }

    private double calculateDistance(
            double lat1,
            double lon1,
            double lat2,
            double lon2) {

        double R = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2)
                        + Math.cos(Math.toRadians(lat1))
                        * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2)
                        * Math.sin(dLon / 2);

        double c =
                2 * Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a));

        return R * c;
    }
}