package com.kumbh.pagination;

import com.kumbh.dto.UserActivityDto;
import com.kumbh.entity.UserActivity;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.repository.UserActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class UserActivityPagination {

    @Autowired
    private UserActivityRepository repository;

    public Page<UserActivityDto> getPaginatedActivities(String search, Integer page, Integer size, String sortBy, String direction) {
        // 1. Set Defaults internally
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 50 : size; // Keeping original default size of 50
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "createdAt" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        // 2. Build the Sort and Pageable objects
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        // 3. Database Query
        Page<UserActivity> activityPage;
        if (search != null && !search.trim().isEmpty()) {
            activityPage = repository.searchActivities(search.trim(), pageable);
        } else {
            activityPage = repository.findAll(pageable);
        }

        // 4. Convert to DTO
        return activityPage.map(EntityDtoMapper::toUserActivityDto);
    }
}
