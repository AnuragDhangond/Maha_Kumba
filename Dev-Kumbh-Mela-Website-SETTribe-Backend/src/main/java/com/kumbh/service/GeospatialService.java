package com.kumbh.service;

import com.kumbh.entity.CrowdStatus;
import com.kumbh.entity.CrowdSector;
import com.kumbh.entity.UserPing;
import com.kumbh.repository.CrowdSectorRepository;
import com.kumbh.repository.UserPingRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GeospatialService {

    @Autowired
    private UserPingRepository userPingRepository;

    @Autowired
    private CrowdSectorRepository crowdSectorRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    // GRID CONSTANTS (Approx 100m)
    private static final double GRID_SIZE = 0.001; 

    @Scheduled(fixedRate = 10000) // Every 10 seconds
    @Transactional
    public void updateGridDensity() {
        // Match the 90s TTL for consistency
        LocalDateTime activeThreshold = LocalDateTime.now().minusSeconds(90);
        List<UserPing> activePings = userPingRepository.findByTimestampAfter(activeThreshold);

        // Group pings by grid cell
        Map<String, Long> gridCounts = activePings.stream()
                .collect(Collectors.groupingBy(
                        ping -> getGridKey(ping.getLatitude(), ping.getLongitude()),
                        Collectors.counting()
                ));

        // Clear and rebuild sectors (or update existing)
        // For production, we'd update existing to minimize DB churn
        List<CrowdSector> currentSectors = crowdSectorRepository.findAll();
        Map<String, CrowdSector> sectorMap = currentSectors.stream()
                .collect(Collectors.toMap(
                        s -> getGridKey(s.getCenterLat(), s.getCenterLng()),
                        s -> s
                ));

        for (Map.Entry<String, Long> entry : gridCounts.entrySet()) {
            String key = entry.getKey();
            Long count = entry.getValue();
            
            CrowdSector sector = sectorMap.get(key);
            if (sector == null) {
                sector = createSectorFromKey(key);
            }
            
            sector.setCurrentDensity(count.intValue());
            sector.setStatus(calculateStatus(count.intValue()));
            sector.setLastUpdated(LocalDateTime.now());
            
            crowdSectorRepository.save(sector);
            sectorMap.remove(key);
        }

        // Sectors no longer having users -> set to GREEN/Zero
        for (CrowdSector idleSector : sectorMap.values()) {
            if (idleSector.getCurrentDensity() > 0) {
                idleSector.setCurrentDensity(0);
                idleSector.setStatus(CrowdStatus.CrowdLevel.GREEN);
                idleSector.setLastUpdated(LocalDateTime.now());
                crowdSectorRepository.save(idleSector);
            }
        }

        // Broadcast updates
        messagingTemplate.convertAndSend("/topic/grid-updates", crowdSectorRepository.findAll());
    }

    private String getGridKey(double lat, double lng) {
        double gridLat = Math.floor(lat / GRID_SIZE) * GRID_SIZE;
        double gridLng = Math.floor(lng / GRID_SIZE) * GRID_SIZE;
        return String.format("%.4f,%.4f", gridLat, gridLng);
    }

    private CrowdSector createSectorFromKey(String key) {
        String[] parts = key.split(",");
        double lat = Double.parseDouble(parts[0]);
        double lng = Double.parseDouble(parts[1]);

        CrowdSector sector = new CrowdSector();
        sector.setCenterLat(lat + GRID_SIZE / 2);
        sector.setCenterLng(lng + GRID_SIZE / 2);

        Coordinate[] coords = new Coordinate[] {
            new Coordinate(lng, lat),
            new Coordinate(lng + GRID_SIZE, lat),
            new Coordinate(lng + GRID_SIZE, lat + GRID_SIZE),
            new Coordinate(lng, lat + GRID_SIZE),
            new Coordinate(lng, lat)
        };
        sector.setBoundary(geometryFactory.createPolygon(coords));
        
        return sector;
    }

    private CrowdStatus.CrowdLevel calculateStatus(int density) {
        if (density >= 4) return CrowdStatus.CrowdLevel.RED;
        if (density >= 2) return CrowdStatus.CrowdLevel.YELLOW;
        return CrowdStatus.CrowdLevel.GREEN;
    }
}
