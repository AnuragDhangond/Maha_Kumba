package com.kumbh.seeders;

import com.kumbh.entity.*;
import com.kumbh.repository.*;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;

@Component
@Order(8)
public class AnalyticsSeeder {

    @Autowired
    private CrowdSectorRepository sectorRepository;
    @Autowired
    private CrowdStatusRepository statusRepository;
    @Autowired
    private UserActivityRepository activityRepository;
    @Autowired
    private UserPingRepository pingRepository;

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public void seed() {
        boolean isSeeding = sectorRepository.count() == 0;
        if (sectorRepository.count() == 0) {
            sectorRepository.save(createSector(19.9975, 73.7898, "Ram Kund Sector"));
            sectorRepository.save(createSector(20.0050, 73.7950, "Panchavati Sector"));
            sectorRepository.save(createSector(19.9900, 73.7800, "Main Ghat Sector"));
            sectorRepository.save(createSector(20.0100, 73.8000, "Outer Parking Sector"));
            sectorRepository.save(createSector(19.9950, 73.7850, "Food Court Sector"));
        }

        if (statusRepository.count() == 0) {
            statusRepository.save(new CrowdStatus(null, "Ram Kund", "Ghat", 19.9975, 73.7898, CrowdStatus.CrowdLevel.RED, 5000));
            statusRepository.save(new CrowdStatus(null, "Kushavarta", "Temple", 19.9500, 73.7000, CrowdStatus.CrowdLevel.YELLOW, 2000));
            statusRepository.save(new CrowdStatus(null, "Main Entrance", "Gate", 20.0000, 73.7800, CrowdStatus.CrowdLevel.GREEN, 500));
            statusRepository.save(new CrowdStatus(null, "Food Court", "Facility", 19.9950, 73.7850, CrowdStatus.CrowdLevel.YELLOW, 1200));
            statusRepository.save(new CrowdStatus(null, "Medical Camp", "Health", 19.9920, 73.7830, CrowdStatus.CrowdLevel.GREEN, 150));
        }

        if (activityRepository.count() == 0) {
            activityRepository.save(createActivity("192.168.1.1", "HomePage", 120L));
            activityRepository.save(createActivity("192.168.1.2", "ShopPage", 300L));
            activityRepository.save(createActivity("192.168.1.3", "EmergencyPage", 45L));
            activityRepository.save(createActivity("192.168.1.4", "StayPage", 600L));
            activityRepository.save(createActivity("192.168.1.5", "VirtualPoojaPage", 450L));
        }

        if (pingRepository.count() == 0) {
            pingRepository.save(new UserPing("DEV-001", 19.9975, 73.7898));
            pingRepository.save(new UserPing("DEV-002", 20.0050, 73.7950));
            pingRepository.save(new UserPing("DEV-003", 19.9900, 73.7800));
            pingRepository.save(new UserPing("DEV-004", 20.0100, 73.8000));
            pingRepository.save(new UserPing("DEV-005", 19.9950, 73.7850));
        }

        if (isSeeding) System.out.println("Analytics data seeded successfully!");
    }

    private UserActivity createActivity(String ip, String page, Long duration) {
        UserActivity a = new UserActivity();
        a.setIpAddress(ip);
        a.setPageVisited(page);
        a.setDuration(duration);
        return a;
    }

    private CrowdSector createSector(double lat, double lng, String name) {
        CrowdSector s = new CrowdSector();
        s.setCenterLat(lat);
        s.setCenterLng(lng);
        s.setCurrentDensity(50);
        s.setStatus(CrowdStatus.CrowdLevel.GREEN);
        
        // Simple square boundary around center
        Coordinate[] coords = new Coordinate[] {
            new Coordinate(lng - 0.01, lat - 0.01),
            new Coordinate(lng + 0.01, lat - 0.01),
            new Coordinate(lng + 0.01, lat + 0.01),
            new Coordinate(lng - 0.01, lat + 0.01),
            new Coordinate(lng - 0.01, lat - 0.01)
        };
        Polygon poly = geometryFactory.createPolygon(coords);
        s.setBoundary(poly);
        return s;
    }
}
