package com.kumbh.controller;

import com.kumbh.dto.SmartRouteResponse;
import com.kumbh.service.RoutingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/routing")
public class SmartRoutingController {

    @Autowired
    private RoutingService routingService;

    @GetMapping("/smart")
    public ResponseEntity<SmartRouteResponse> getSmartRoute(
            @RequestParam double startLat,
            @RequestParam double startLng,
            @RequestParam double endLat,
            @RequestParam double endLng) {
        
        return ResponseEntity.ok(routingService.getSmartRoute(startLat, startLng, endLat, endLng));
    }
}
