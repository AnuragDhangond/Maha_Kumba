package com.kumbh.pagination;

import com.kumbh.dto.LiveDarshanDto;
import com.kumbh.entity.LiveDarshan;
import com.kumbh.mapper.LiveDarshanMapper;
import com.kumbh.repository.LiveDarshanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class LiveDarshanPagination {

    @Autowired
    private LiveDarshanRepository repository;

    @Autowired
    private LiveDarshanMapper mapper;

    public Page<LiveDarshanDto> getPaginatedDarshans(String search, Integer page, Integer size, String sortBy, String direction) {
        // Centralized Pagination Defaults
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<LiveDarshan> darshanPage;
        if (search != null && !search.trim().isEmpty()) {
            darshanPage = repository.searchDarshans(search.trim(), pageable);
        } else {
            darshanPage = repository.findAll(pageable);
        }

        return darshanPage.map(mapper::toDto);
    }
}
