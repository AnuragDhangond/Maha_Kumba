// Added for user activity tracking
package com.kumbh.controller;

import com.kumbh.service.UserActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/activity")
public class UserActivityController {

    private static final Logger log = LoggerFactory.getLogger(UserActivityController.class);

    @Autowired
    private UserActivityService service;

    public static class ActivityRequest {
        private String pageVisited;
        private Long duration;

        public ActivityRequest() {}

        public String getPageVisited() { return pageVisited; }
        public void setPageVisited(String pageVisited) { this.pageVisited = pageVisited; }

        public Long getDuration() { return duration; }
        public void setDuration(Long duration) { this.duration = duration; }
    }

    @PostMapping("/track")
    public ResponseEntity<String> trackActivity(@RequestBody ActivityRequest request, HttpServletRequest httpRequest) {
        log.debug("[Activity API] Received tracking request: Page={}, Duration={}s", request.getPageVisited(), request.getDuration());
        
        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = httpRequest.getRemoteAddr();
        }

        service.logActivity(ipAddress, request.getPageVisited(), request.getDuration());
        
        return ResponseEntity.ok("Activity logged");
    }

    @GetMapping("/total-users")
    public ResponseEntity<Map<String, Object>> getTotalUsers() {
        return ResponseEntity.ok(service.getUserStats());
    }

    @GetMapping("/today-overview")
    public ResponseEntity<Map<String, Object>> getTodayOverview() {
        return ResponseEntity.ok(service.getTodayOverview());
    }

    @GetMapping("/all")
    public ResponseEntity<org.springframework.data.domain.Page<com.kumbh.dto.UserActivityDto>> getAllActivities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction
    ) {
        return ResponseEntity.ok(service.getPaginatedActivities(search, page, size, sortBy, direction));
    }
}