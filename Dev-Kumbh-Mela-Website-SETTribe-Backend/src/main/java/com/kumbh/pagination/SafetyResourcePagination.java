package com.kumbh.pagination;

import com.kumbh.dto.SafetyResourceDto;
import com.kumbh.entity.SafetyResource;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.repository.SafetyResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class SafetyResourcePagination {

    @Autowired
    private SafetyResourceRepository repository;

    public Page<SafetyResourceDto> getPaginatedResources(String search, Integer page, Integer size, String sortBy, String direction) {
        // Centralized Pagination Defaults
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<SafetyResource> resourcePage;
        if (search != null && !search.trim().isEmpty()) {
            resourcePage = repository.searchResources(search.trim(), pageable);
        } else {
            resourcePage = repository.findAll(pageable);
        }

        return resourcePage.map(EntityDtoMapper::toSafetyResourceDto);
    }
}
