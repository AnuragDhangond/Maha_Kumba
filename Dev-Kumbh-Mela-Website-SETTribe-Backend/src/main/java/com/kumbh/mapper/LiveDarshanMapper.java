package com.kumbh.mapper;

import com.kumbh.dto.LiveDarshanDto;
import com.kumbh.entity.LiveDarshan;
import org.springframework.stereotype.Component;

@Component
public class LiveDarshanMapper {

    public LiveDarshanDto toDto(LiveDarshan entity) {
        if (entity == null) {
            return null;
        }
        LiveDarshanDto dto = new LiveDarshanDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setLocation(entity.getLocation());
        dto.setViewers(entity.getViewers());
        dto.setImagePath(entity.getImagePath());
        dto.setStatus(entity.getStatus());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setTime(entity.getTime());
        dto.setLink(entity.getLink());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public LiveDarshan toEntity(LiveDarshanDto dto) {
        if (dto == null) {
            return null;
        }
        LiveDarshan entity = new LiveDarshan();
        entity.setId(dto.getId());
        entity.setTitle(dto.getTitle());
        entity.setLocation(dto.getLocation());
        entity.setViewers(dto.getViewers());
        entity.setImagePath(dto.getImagePath());
        entity.setStatus(dto.getStatus());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setTime(dto.getTime());
        entity.setLink(dto.getLink());
        return entity;
    }
}
