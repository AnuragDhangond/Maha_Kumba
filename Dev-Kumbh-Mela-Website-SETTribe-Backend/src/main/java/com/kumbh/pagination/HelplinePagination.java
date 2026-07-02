package com.kumbh.pagination;

import com.kumbh.dto.HelplineDto;
import com.kumbh.entity.Helpline;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.repository.HelplineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class HelplinePagination {

    @Autowired
    private HelplineRepository repository;

    public Page<HelplineDto> getPaginatedHelplines(String search, Integer page, Integer size, String sortBy, String direction, boolean includeInactive) {
        // Centralized Pagination Defaults
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<Helpline> helplinePage;
        if (search != null && !search.trim().isEmpty()) {
            if (includeInactive) {
                // Assuming you need a custom query or a way to search all records regardless of status
                helplinePage = repository.findAll(pageable); // Simplified, refine if filtering search on all records is needed
            } else {
                helplinePage = repository.searchHelplines(search.trim(), pageable);
            }
        } else {
            if (includeInactive) {
                helplinePage = repository.findAll(pageable);
            } else {
                helplinePage = repository.findAllActive(pageable);
            }
        }

        return helplinePage.map(EntityDtoMapper::toHelplineDto);
    }
}
