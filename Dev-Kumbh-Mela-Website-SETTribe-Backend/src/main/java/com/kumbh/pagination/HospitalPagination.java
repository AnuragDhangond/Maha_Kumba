package com.kumbh.pagination;

import com.kumbh.dto.HospitalDto;
import com.kumbh.entity.Hospital;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.repository.HospitalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class HospitalPagination {

    @Autowired
    private HospitalRepository repository;

    public Page<HospitalDto> getPaginatedHospitals(String search, Integer page, Integer size, String sortBy, String direction) {
        // Centralized Pagination Defaults
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<Hospital> hospitalPage;
        if (search != null && !search.trim().isEmpty()) {
            hospitalPage = repository.searchHospitals(search.trim(), pageable);
        } else {
            hospitalPage = repository.findAll(pageable);
        }

        return hospitalPage.map(EntityDtoMapper::toHospitalDto);
    }
}
