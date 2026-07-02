package com.kumbh.dto;

import com.kumbh.entity.CrowdStatus;
import lombok.Data;
import java.util.List;

@Data
public class SmartRouteResponse {
    private List<LatLng> path;
    private double distance; // in km
    private int duration; // in minutes
    private CrowdStatus.CrowdLevel safetyStatus;
    private List<String> warnings;
    private String polyline;

    @Data
    public static class LatLng {
        private double lat;
        private double lng;
        
        public LatLng(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }
    }
}
