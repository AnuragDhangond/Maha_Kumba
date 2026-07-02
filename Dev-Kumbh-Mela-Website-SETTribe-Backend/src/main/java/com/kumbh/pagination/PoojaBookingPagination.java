package com.kumbh.pagination;

import com.kumbh.dto.PoojaBookingDTO;
import com.kumbh.entity.PoojaBooking;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.repository.PoojaBookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class PoojaBookingPagination {

    @Autowired
    private PoojaBookingRepository repository;

    public Page<PoojaBookingDTO> getPaginatedBookings(String search, Integer page, Integer size, String sortBy, String direction) {
        // Centralized Pagination Defaults
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<PoojaBooking> bookingPage;
        if (search != null && !search.trim().isEmpty()) {
            bookingPage = repository.searchBookings(search.trim(), pageable);
        } else {
            bookingPage = repository.findAll(pageable);
        }

        return bookingPage.map(EntityDtoMapper::toPoojaBookingDto);
    }
}
