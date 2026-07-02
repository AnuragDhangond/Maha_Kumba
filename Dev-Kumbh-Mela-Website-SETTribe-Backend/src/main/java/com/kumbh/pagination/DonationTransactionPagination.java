package com.kumbh.pagination;

import com.kumbh.dto.DonationTransactionDto;
import com.kumbh.entity.DonationTransaction;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.repository.DonationTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class DonationTransactionPagination {

    @Autowired
    private DonationTransactionRepository repository;

    public Page<DonationTransactionDto> getPaginatedDonations(String search, Integer page, Integer size, String sortBy, String direction) {
        // 1. Set Defaults internally
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        // 2. Build the Sort and Pageable objects
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        // 3. Database Query
        Page<DonationTransaction> donationPage;
        if (search != null && !search.trim().isEmpty()) {
            donationPage = repository.searchDonations(search.trim(), pageable);
        } else {
            donationPage = repository.findAll(pageable);
        }

        // 4. Convert to DTO
        return donationPage.map(EntityDtoMapper::toDonationTransactionDto);
    }
}
