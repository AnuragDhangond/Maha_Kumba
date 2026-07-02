package com.kumbh.pagination;

import com.kumbh.dto.LiveUpdateDto;
import com.kumbh.entity.LiveUpdate;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.repository.LiveUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class LiveUpdatePagination {

    @Autowired
    private LiveUpdateRepository repository;

    public Page<LiveUpdateDto> getPaginatedUpdates(String search, String category, Integer page, Integer size, String sortBy, String direction) {
        // 1. Set Defaults internally
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "createdAt" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        // 2. Build the Sort and Pageable objects
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        // 3. Database Query
        Page<LiveUpdate> liveUpdatePage = repository.findWithFilters(search, category, pageable);

        // 4. Convert to DTO
        return liveUpdatePage.map(EntityDtoMapper::toLiveUpdateDto);
    }
}
