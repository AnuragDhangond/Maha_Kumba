package com.kumbh.service.impl;

import com.kumbh.dto.LiveDarshanDto;
import com.kumbh.entity.LiveDarshan;
import com.kumbh.mapper.LiveDarshanMapper;
import com.kumbh.pagination.LiveDarshanPagination;
import com.kumbh.repository.LiveDarshanRepository;
import com.kumbh.service.LiveDarshanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LiveDarshanServiceImpl implements LiveDarshanService {

    @Autowired
    private LiveDarshanRepository repository;

    @Autowired
    private LiveDarshanMapper mapper;

    @Autowired
    private LiveDarshanPagination pagination;

    @Override
    public LiveDarshanDto createDarshan(LiveDarshanDto darshanDto) {
        LiveDarshan entity = mapper.toEntity(darshanDto);
        return mapper.toDto(repository.save(entity));
    }

    @Override
    public List<LiveDarshanDto> getAllDarshans() {
        return repository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<LiveDarshanDto> getAllDarshans(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedDarshans(search, page, size, sortBy, direction);
    }

    @Override
    public LiveDarshanDto getDarshanById(Long id) {
        LiveDarshan entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Darshan not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    public LiveDarshanDto updateDarshan(Long id, LiveDarshanDto darshanDto) {
        LiveDarshan existingEntity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Darshan not found with id: " + id));
        
        existingEntity.setTitle(darshanDto.getTitle());
        existingEntity.setLocation(darshanDto.getLocation());
        existingEntity.setViewers(darshanDto.getViewers());
        existingEntity.setStatus(darshanDto.getStatus());
        existingEntity.setStartTime(darshanDto.getStartTime());
        existingEntity.setEndTime(darshanDto.getEndTime());
        existingEntity.setTime(darshanDto.getTime());
        existingEntity.setLink(darshanDto.getLink());
        
        if (darshanDto.getImagePath() != null) {
            existingEntity.setImagePath(darshanDto.getImagePath());
        }
        
        return mapper.toDto(repository.save(existingEntity));
    }

    @Override
    public void deleteDarshan(Long id) {
        repository.deleteById(id);
    }
}
