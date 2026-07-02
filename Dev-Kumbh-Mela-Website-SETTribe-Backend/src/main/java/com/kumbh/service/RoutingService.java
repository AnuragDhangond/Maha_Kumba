package com.kumbh.service;

import com.kumbh.dto.SmartRouteResponse;
import com.kumbh.entity.CrowdStatus;
import com.kumbh.entity.CrowdSector;
import com.kumbh.repository.CrowdSectorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoutingService {

    @Autowired
    private CrowdSectorRepository crowdSectorRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public SmartRouteResponse getSmartRoute(double startLat, double startLng, double endLat, double endLng) {
        // In production, this would call Google Directions API:
        // String url = "https://maps.googleapis.com/maps/api/directions/json?origin=" + startLat + "," + startLng + ...
        
        // Simulating a route for demo
        SmartRouteResponse response = new SmartRouteResponse();
        List<SmartRouteResponse.LatLng> path = new ArrayList<>();
        path.add(new SmartRouteResponse.LatLng(startLat, startLng));
        
        // Simple linear interpolation for demo path
        int steps = 10;
        for (int i = 1; i < steps; i++) {
            double lat = startLat + (endLat - startLat) * i / steps;
            double lng = startLng + (endLng - startLng) * i / steps;
            path.add(new SmartRouteResponse.LatLng(lat, lng));
        }
        path.add(new SmartRouteResponse.LatLng(endLat, endLng));
        
        response.setPath(path);
        response.setDistance(calculateDistance(startLat, startLng, endLat, endLng));
        response.setDuration((int) (response.getDistance() * 15)); // Approx 15 min per km walking
        
        // Smart Logic: Check if path intersects RED sectors
        analyzeRouteSafety(response);
        
        return response;
    }

    private void analyzeRouteSafety(SmartRouteResponse response) {
        List<String> warnings = new ArrayList<>();
        CrowdStatus.CrowdLevel overallStatus = CrowdStatus.CrowdLevel.GREEN;

        for (SmartRouteResponse.LatLng point : response.getPath()) {
            CrowdSector sector = crowdSectorRepository.findByLocation(point.getLat(), point.getLng());
            if (sector != null && sector.getStatus() == CrowdStatus.CrowdLevel.RED) {
                overallStatus = CrowdStatus.CrowdLevel.RED;
                warnings.add("Route passes through overcrowded zone near " + sector.getCenterLat() + ", " + sector.getCenterLng());
                break;
            } else if (sector != null && sector.getStatus() == CrowdStatus.CrowdLevel.YELLOW && overallStatus != CrowdStatus.CrowdLevel.RED) {
                overallStatus = CrowdStatus.CrowdLevel.YELLOW;
            }
        }

        response.setSafetyStatus(overallStatus);
        response.setWarnings(warnings);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
