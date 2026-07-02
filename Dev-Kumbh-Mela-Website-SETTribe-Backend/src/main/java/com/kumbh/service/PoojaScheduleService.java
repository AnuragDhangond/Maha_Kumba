package com.kumbh.service;

import com.kumbh.dto.PoojaScheduleDTO;
import com.kumbh.entity.PoojaSchedule;
import com.kumbh.pagination.PoojaSchedulePagination;
import com.kumbh.repository.PoojaScheduleRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class PoojaScheduleService {

    @Autowired
    private PoojaScheduleRepository repository;

    @Autowired
    private PoojaSchedulePagination pagination;

    public Page<PoojaScheduleDTO> getAllSchedules(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedSchedules(search, page, size, sortBy, direction);
    }

    public PoojaScheduleDTO createSchedule(PoojaScheduleDTO dto) {
        PoojaSchedule entity = new PoojaSchedule();
        BeanUtils.copyProperties(dto, entity, "id", "createdAt", "updatedAt");
        PoojaSchedule saved = repository.save(entity);
        return convertToDTO(saved);
    }

    public PoojaScheduleDTO updateSchedule(Long id, PoojaScheduleDTO dto) {
        PoojaSchedule entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found with id: " + id));
        
        BeanUtils.copyProperties(dto, entity, "id", "createdAt", "updatedAt");
        PoojaSchedule updated = repository.save(entity);
        return convertToDTO(updated);
    }

    public void deleteSchedule(Long id) {
        repository.deleteById(id);
    }

    private PoojaScheduleDTO convertToDTO(PoojaSchedule entity) {
        PoojaScheduleDTO dto = new PoojaScheduleDTO();
        BeanUtils.copyProperties(entity, dto, "createdAt", "updatedAt");
        if (entity.getCreatedAt() != null) {
            dto.setCreatedAt(entity.getCreatedAt().toString());
        }
        if (entity.getUpdatedAt() != null) {
            dto.setUpdatedAt(entity.getUpdatedAt().toString());
        }
        return dto;
    }
}
