package com.kumbh.pagination;

import com.kumbh.dto.ArtisanDto;
import com.kumbh.entity.Artisan;
import com.kumbh.repository.ArtisanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class ArtisanPagination {

    @Autowired
    private ArtisanRepository artisanRepository;

    public Page<ArtisanDto> getPaginatedArtisans(String search, Integer page, Integer size, String sortBy, String direction) {
        // Centralized Pagination Defaults
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);
        
        Page<Artisan> artisanPage = artisanRepository.searchArtisans(search, pageable);
        return artisanPage.map(this::mapToDto);
    }

    private ArtisanDto mapToDto(Artisan a) {
        ArtisanDto dto = new ArtisanDto();
        dto.setId(a.getId());
        dto.setArtisanName(a.getArtisanName());
        dto.setCraft(a.getCraft());
        dto.setRegion(a.getRegion());
        dto.setDescription(a.getDescription());
        dto.setImageUrl(a.getImageUrl());
        dto.setIsActive(a.getIsActive());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }
}
