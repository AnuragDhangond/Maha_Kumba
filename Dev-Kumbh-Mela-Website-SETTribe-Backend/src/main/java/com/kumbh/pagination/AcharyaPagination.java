package com.kumbh.pagination;

import com.kumbh.dto.AcharyaDTO;
import com.kumbh.dto.PoojaItemDTO;
import com.kumbh.entity.Acharya;
import com.kumbh.entity.PoojaItem;
import com.kumbh.repository.AcharyaRepository;
import com.kumbh.repository.PoojaItemRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AcharyaPagination {

    @Autowired
    private AcharyaRepository repository;

    @Autowired
    private PoojaItemRepository poojaItemRepository;

    public Page<AcharyaDTO> getPaginatedAcharyas(String search, Integer page, Integer size, String sortBy, String direction) {
        // Centralized Pagination Defaults
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<Acharya> acharyaPage;
        if (search != null && !search.trim().isEmpty()) {
            acharyaPage = repository.searchAcharyas(search.trim(), pageable);
        } else {
            acharyaPage = repository.findAll(pageable);
        }

        return acharyaPage.map(this::mapToDTO);
    }

    private AcharyaDTO mapToDTO(Acharya entity) {
        AcharyaDTO dto = new AcharyaDTO();
        BeanUtils.copyProperties(entity, dto, "createdAt", "updatedAt");
        
        List<PoojaItem> poojas = poojaItemRepository.findByAcharyaId(entity.getId());
        if (poojas != null) {
            dto.setPoojas(poojas.stream().map(p -> {
                PoojaItemDTO pDto = new PoojaItemDTO();
                BeanUtils.copyProperties(p, pDto);
                return pDto;
            }).collect(Collectors.toList()));
        }
        
        if (entity.getCreatedAt() != null) dto.setCreatedAt(entity.getCreatedAt().toString());
        if (entity.getUpdatedAt() != null) dto.setUpdatedAt(entity.getUpdatedAt().toString());
        
        return dto;
    }
}
