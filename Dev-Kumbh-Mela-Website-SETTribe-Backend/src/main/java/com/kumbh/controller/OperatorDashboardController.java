package com.kumbh.controller;

import com.kumbh.dto.CrowdStatusDto;
import com.kumbh.dto.EmergencyAlertDto;
import com.kumbh.dto.HospitalDto;
import com.kumbh.dto.LiveUpdateDto;
import com.kumbh.dto.OperatorDashboardSummaryDto;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.repository.CrowdStatusRepository;
import com.kumbh.service.EmergencyAlertService;
import com.kumbh.service.HospitalService;
import com.kumbh.service.LiveUpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/operator/dashboard")
public class OperatorDashboardController {

    @Autowired
    private EmergencyAlertService emergencyAlertService;

    @Autowired
    private HospitalService hospitalService;

    @Autowired
    private CrowdStatusRepository crowdStatusRepository;

    @Autowired
    private LiveUpdateService liveUpdateService;

    @GetMapping("/summary")
    public ResponseEntity<OperatorDashboardSummaryDto> getSummary() {
        List<EmergencyAlertDto> alerts = emergencyAlertService.getAllAlerts().stream()
                .map(EntityDtoMapper::toEmergencyAlertDto)
                .collect(Collectors.toList());

        List<HospitalDto> hospitals = hospitalService.getAllHospitalsList().stream()
                .map(hospital -> new HospitalDto(
                        hospital.getId(),
                        hospital.getName(),
                        hospital.getAddress(),
                        hospital.getLatitude(),
                        hospital.getLongitude(),
                        hospital.getContact(),
                        hospital.getBeds(),
                        hospital.getStatus()))
                .collect(Collectors.toList());

        List<CrowdStatusDto> crowdStatuses = crowdStatusRepository.findAll().stream()
                .map(EntityDtoMapper::toCrowdStatusDto)
                .collect(Collectors.toList());

        List<LiveUpdateDto> liveUpdates = liveUpdateService.getAllUpdates().stream()
                .map(EntityDtoMapper::toLiveUpdateDto)
                .collect(Collectors.toList());

        OperatorDashboardSummaryDto summary = new OperatorDashboardSummaryDto();
        summary.setActiveSosCount((int) alerts.stream()
                .filter(alert -> hasAnyStatus(alert.getStatus(), "pending", "accepted"))
                .count());
        summary.setResolvedSosCount((int) alerts.stream()
                .filter(alert -> hasAnyStatus(alert.getStatus(), "resolved"))
                .count());
        summary.setHospitalBedsCount(hospitals.stream()
                .filter(h -> hasAnyStatus(h.getStatus(), "active", "full"))
                .mapToInt(hospital -> hospital.getBeds() != null ? hospital.getBeds() : 0)
                .sum());
        summary.setActiveHospitalCount((int) hospitals.stream()
                .filter(h -> hasAnyStatus(h.getStatus(), "active", "full"))
                .count());
        summary.setHighCrowdZonesCount((int) crowdStatuses.stream()
                .filter(status -> status.getCrowdLevel() == CrowdStatusDto.CrowdLevel.RED)
                .count());
        summary.setLiveUpdatesCount((int) liveUpdates.stream()
                .filter(update -> {
                    String category = normalize(update.getCategory());
                    return category.isEmpty() || "live_update".equals(category);
                })
                .count());
        /* summary.setEssentialServicesCount((int) liveUpdates.stream()
                .filter(update -> "essential_service".equals(normalize(update.getCategory())))
                .count()); */
        summary.setRecentIncidents(alerts.stream()
                .sorted(Comparator.comparing(EmergencyAlertDto::getReportedTime,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(3)
                .collect(Collectors.toList()));

        CrowdStatusDto primaryZone = crowdStatuses.stream()
                .sorted(Comparator
                        .comparing((CrowdStatusDto status) -> crowdPriority(status.getCrowdLevel()))
                        .thenComparing(CrowdStatusDto::getLastUpdated,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                .findFirst()
                .orElse(null);

        if (primaryZone != null) {
            String level = primaryZone.getCrowdLevel() != null ? primaryZone.getCrowdLevel().name() : "UNKNOWN";
            summary.setZoneStatusLabel(primaryZone.getLocationName() + " - " + level);
            summary.setZoneStatusUpdatedAt(primaryZone.getLastUpdated());
        } else {
            summary.setZoneStatusLabel("All zones normal");
        }

        summary.setGeneratedAt(LocalDateTime.now());
        return ResponseEntity.ok(summary);
    }

    private static boolean hasAnyStatus(String value, String... acceptedStatuses) {
        String normalized = normalize(value);
        for (String accepted : acceptedStatuses) {
            if (normalized.equals(accepted)) {
                return true;
            }
        }
        return false;
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replace(' ', '_');
    }

    private static int crowdPriority(CrowdStatusDto.CrowdLevel level) {
        if (level == null) {
            return 99;
        }
        switch (level) {
            case RED:
                return 0;
            case YELLOW:
                return 1;
            case GREEN:
                return 2;
            default:
                return 99;
        }
    }
}
