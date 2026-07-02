package com.kumbh.service;

import com.kumbh.dto.EmergencyAlertDto;
import com.kumbh.entity.EmergencyAlert;
import com.kumbh.pagination.EmergencyAlertPagination;
import com.kumbh.repository.EmergencyAlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.kumbh.mapper.EntityDtoMapper;
import java.util.List;
import java.util.Optional;

@Service
public class EmergencyAlertService {

    @Autowired
    private EmergencyAlertRepository repository;

    @Autowired
    private EmergencyAlertPagination pagination;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public EmergencyAlert createAlert(Double latitude, Double longitude, String emergencyType) {
        EmergencyAlert alert = new EmergencyAlert();
        alert.setLatitude(latitude);
        alert.setLongitude(longitude);
        alert.setEmergencyType(emergencyType);
        alert.setAlertId(generateAlertId());
        alert.setPriority(determinePriority(emergencyType));
        alert.setStatus("Pending");
        
        EmergencyAlert savedAlert = repository.save(alert);
        messagingTemplate.convertAndSend("/topic/sos", EntityDtoMapper.toEmergencyAlertDto(savedAlert));
        return savedAlert;
    }

    private String generateAlertId() {
        Optional<String> lastId = repository.findLastAlertId();
        int nextNum = 1;
        if (lastId.isPresent()) {
            String idStr = lastId.get().substring(3);
            nextNum = Integer.parseInt(idStr) + 1;
        }
        return String.format("EMG%03d", nextNum);
    }

    private String determinePriority(String type) {
        if (type == null) return "Low";
        switch (type.toLowerCase()) {
            case "fire": return "Critical";
            case "medical": return "High";
            case "crowd issue": return "High";
            case "lost person": return "Medium";
            default: return "Low";
        }
    }

    public List<EmergencyAlert> getAllAlerts() {
        return repository.findAll();
    }

    public Page<EmergencyAlertDto> getAllAlerts(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedAlerts(search, page, size, sortBy, direction);
    }

    public Optional<EmergencyAlert> getAlertByAlertId(String alertId) {
        return repository.findByAlertId(alertId);
    }

    public Optional<EmergencyAlert> acceptAlert(Long id, String adminName) {
        return repository.findById(id).map(alert -> {
            alert.setStatus("Accepted");
            alert.setAcceptedBy(adminName);
            EmergencyAlert savedAlert = repository.save(alert);
            messagingTemplate.convertAndSend("/topic/sos", EntityDtoMapper.toEmergencyAlertDto(savedAlert));
            return savedAlert;
        });
    }

    public Optional<EmergencyAlert> resolveAlert(Long id, String resolverName) {
        return repository.findById(id).map(alert -> {
            alert.setStatus("Resolved");
            alert.setResolvedBy(resolverName);
            alert.setResolvedTime(LocalDateTime.now());
            EmergencyAlert savedAlert = repository.save(alert);
            messagingTemplate.convertAndSend("/topic/sos", EntityDtoMapper.toEmergencyAlertDto(savedAlert));
            return savedAlert;
        });
    }
}
