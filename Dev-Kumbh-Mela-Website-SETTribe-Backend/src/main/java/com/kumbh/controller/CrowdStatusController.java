package com.kumbh.controller;

import com.kumbh.dto.CrowdStatusDto;
import com.kumbh.entity.CrowdStatus;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.repository.CrowdStatusRepository;
import com.kumbh.service.CrowdAnalyticsService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.kumbh.entity.UserPing;
import com.kumbh.repository.UserPingRepository;

@RestController
@RequestMapping("/api/crowd-status")
public class CrowdStatusController {

@Autowired
private CrowdStatusRepository repository;

@Autowired
private SimpMessagingTemplate messagingTemplate;

@Autowired
private CrowdAnalyticsService crowdAnalyticsService;

@Autowired
private UserPingRepository userPingRepository;
    // Pilgrim app sends GPS pings here every 30-60 seconds
    @PostMapping("/ping")
    public ResponseEntity<String> reportLocation(@RequestBody Map<String, Object> payload) {
        String deviceId = (String) payload.get("deviceId");
        Double lat = (Double) payload.get("latitude");
        Double lon = (Double) payload.get("longitude");

        if (deviceId != null && lat != null && lon != null) {
            crowdAnalyticsService.processUserPing(deviceId, lat, lon);
            return ResponseEntity.ok("Ping received");
        }
        return ResponseEntity.badRequest().body("Invalid ping data");
    }

    // When a user leaves the app or logs out
    @PostMapping("/disconnect")
    public ResponseEntity<String> disconnect(@RequestBody Map<String, String> payload) {
        String deviceId = payload.get("deviceId");
        if (deviceId != null) {
            crowdAnalyticsService.removeUserPing(deviceId);
            return ResponseEntity.ok("User disconnected");
        }
        return ResponseEntity.badRequest().body("DeviceId required");
    }

    // Get all active pings for the heatmap
    @GetMapping("/pings")
    public List<UserPing> getAllPings() {
        return userPingRepository.findAll();
    }

    // Manually trigger a density recalculation
    @PostMapping("/refresh-density")
    public ResponseEntity<String> refreshDensity() {
        crowdAnalyticsService.updateLiveCrowdDensity();
        return ResponseEntity.ok("Density recalculated and broadcasted");
    }

    @GetMapping
    public List<CrowdStatusDto> getAllStatus() {
        return repository.findAll().stream()
                .map(EntityDtoMapper::toCrowdStatusDto)
                .collect(Collectors.toList());
    }

    @PostMapping
    public CrowdStatusDto updateStatus(@RequestBody CrowdStatusDto statusDto) {
        CrowdStatus status = EntityDtoMapper.toCrowdStatusEntity(statusDto);
        CrowdStatusDto result;
        // If updating existing by id
        if (status.getId() != null) {
            CrowdStatus existing = repository.findById(status.getId()).orElse(status);
            existing.setCrowdLevel(status.getCrowdLevel());
            result = EntityDtoMapper.toCrowdStatusDto(repository.save(existing));
        } else {
            result = EntityDtoMapper.toCrowdStatusDto(repository.save(status));
        }

        messagingTemplate.convertAndSend("/topic/crowd-updates", result);
        return result;
    }

    @PutMapping("/{id}")
    public ResponseEntity<CrowdStatusDto> updateCrowdLevel(@PathVariable Long id, @RequestBody CrowdStatusDto.CrowdLevel levelDto) {
        CrowdStatus.CrowdLevel level = CrowdStatus.CrowdLevel.valueOf(levelDto.name());
        return repository.findById(id).map(status -> {
            status.setCrowdLevel(level);
            status.setManualOverride(true); // Persist manual decision
            CrowdStatusDto result = EntityDtoMapper.toCrowdStatusDto(repository.save(status));
            messagingTemplate.convertAndSend("/topic/crowd-updates", result);
            return ResponseEntity.ok(result);
        }).orElse(ResponseEntity.notFound().build());
    }


    @PostMapping("/{id}/release")
    public ResponseEntity<CrowdStatusDto> releaseOverride(@PathVariable Long id) {
        return repository.findById(id).map(status -> {
            status.setManualOverride(false);
            CrowdStatusDto result = EntityDtoMapper.toCrowdStatusDto(repository.save(status));
            messagingTemplate.convertAndSend("/topic/crowd-updates", result);
            return ResponseEntity.ok(result);
        }).orElse(ResponseEntity.notFound().build());
    }
}