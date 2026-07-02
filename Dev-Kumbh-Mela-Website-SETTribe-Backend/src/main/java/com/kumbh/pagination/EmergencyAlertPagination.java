package com.kumbh.pagination;

import com.kumbh.dto.EmergencyAlertDto;
import com.kumbh.entity.EmergencyAlert;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.repository.EmergencyAlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class EmergencyAlertPagination {

    @Autowired
    private EmergencyAlertRepository repository;

    public Page<EmergencyAlertDto> getPaginatedAlerts(String search, Integer page, Integer size, String sortBy, String direction) {
        // Centralized Pagination Defaults
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<EmergencyAlert> alertPage;
        if (search != null && !search.trim().isEmpty()) {
            alertPage = repository.searchAlerts(search.trim(), pageable);
        } else {
            alertPage = repository.findAll(pageable);
        }

        return alertPage.map(EntityDtoMapper::toEmergencyAlertDto);
    }
}
