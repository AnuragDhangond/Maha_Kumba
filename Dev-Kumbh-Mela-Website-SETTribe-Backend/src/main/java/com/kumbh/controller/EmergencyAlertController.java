package com.kumbh.controller;

import com.kumbh.dto.EmergencyAlertDto;
import com.kumbh.entity.EmergencyAlert;
import com.kumbh.entity.User;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.service.EmergencyAlertService;
import com.kumbh.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

@RestController
@RequestMapping("/api/emergency")
public class EmergencyAlertController {

    @Autowired
    private EmergencyAlertService service;

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<EmergencyAlertDto> createAlert(@RequestBody Map<String, Object> payload, HttpServletResponse response) {
        Double lat = Double.valueOf(payload.get("latitude").toString());
        Double lon = Double.valueOf(payload.get("longitude").toString());
        String type = payload.get("emergencyType").toString();
        
        EmergencyAlert alert = service.createAlert(lat, lon, type);
        
        Cookie cookie = new Cookie("activeSOS_alertId", alert.getAlertId());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 24 hours
        response.addCookie(cookie);
        
        return ResponseEntity.ok(EntityDtoMapper.toEmergencyAlertDto(alert));
    }

    @GetMapping("/list")
    public ResponseEntity<Page<EmergencyAlertDto>> listAlerts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return ResponseEntity.ok(service.getAllAlerts(search, page, size, sortBy, direction));
    }

    @GetMapping("/status/{alertId}")
    public ResponseEntity<EmergencyAlertDto> getStatus(@PathVariable String alertId) {
        return service.getAlertByAlertId(alertId)
                .map(alert -> ResponseEntity.ok(EntityDtoMapper.toEmergencyAlertDto(alert)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-status")
    public ResponseEntity<EmergencyAlertDto> getMyStatus(@CookieValue(name = "activeSOS_alertId", required = false) String alertId, HttpServletResponse response) {
        if (alertId == null || alertId.isBlank()) {
            return ResponseEntity.noContent().build();
        }
        
        return service.getAlertByAlertId(alertId)
                .map(alert -> {
                    if ("RESOLVED".equalsIgnoreCase(alert.getStatus())) {
                        Cookie cookie = new Cookie("activeSOS_alertId", "");
                        cookie.setHttpOnly(true);
                        cookie.setPath("/");
                        cookie.setMaxAge(0);
                        response.addCookie(cookie);
                    }
                    return ResponseEntity.ok(EntityDtoMapper.toEmergencyAlertDto(alert));
                })
                .orElseGet(() -> {
                    Cookie cookie = new Cookie("activeSOS_alertId", "");
                    cookie.setHttpOnly(true);
                    cookie.setPath("/");
                    cookie.setMaxAge(0);
                    response.addCookie(cookie);
                    return ResponseEntity.noContent().build();
                });
    }

    @PostMapping("/accept/{id}")
    public ResponseEntity<?> acceptAlert(@PathVariable Long id,
                                         @RequestParam(required = false) String adminName,
                                         Authentication authentication) {
        String acceptedBy = resolveActorName(adminName, authentication);
        return service.acceptAlert(id, acceptedBy)
                .map(alert -> ResponseEntity.ok(EntityDtoMapper.toEmergencyAlertDto(alert)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/resolve/{id}")
    public ResponseEntity<?> resolveAlert(@PathVariable Long id,
                                          @RequestParam(required = false) String adminName,
                                          Authentication authentication) {
        String resolvedBy = resolveActorName(adminName, authentication);
        return service.resolveAlert(id, resolvedBy)
                .map(alert -> ResponseEntity.ok(EntityDtoMapper.toEmergencyAlertDto(alert)))
                .orElse(ResponseEntity.notFound().build());
    }

    private String resolveActorName(String providedName, Authentication authentication) {
        if (providedName != null && !providedName.isBlank()) {
            return providedName;
        }

        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            Long userId = (Long) authentication.getPrincipal();
            User user = userService.getAllUsersList().stream()
                    .filter(existingUser -> Long.valueOf(existingUser.getId()).equals(userId))
                    .findFirst()
                    .orElse(null);
            if (user != null && user.getName() != null && !user.getName().isBlank()) {
                return user.getName();
            }
            if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
                return user.getEmail();
            }
        }

        return "Operator";
    }
}
