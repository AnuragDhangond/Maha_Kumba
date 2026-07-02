package com.kumbh.pagination;

import com.kumbh.dto.HeritageHistoryDto;
import com.kumbh.dto.KumbhHighlightDto;
import com.kumbh.dto.SaintDirectoryDto;
import com.kumbh.dto.SpiritualPlaceDto;
import com.kumbh.entity.HeritageHistory;
import com.kumbh.entity.KumbhHighlight;
import com.kumbh.entity.SaintDirectory;
import com.kumbh.entity.SpiritualPlace;
import com.kumbh.repository.HeritageHistoryRepository;
import com.kumbh.repository.KumbhHighlightRepository;
import com.kumbh.repository.SaintDirectoryRepository;
import com.kumbh.repository.SpiritualPlaceRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class HeritagePagination {

    @Autowired
    private HeritageHistoryRepository historyRepository;

    @Autowired
    private KumbhHighlightRepository highlightRepository;

    @Autowired
    private SaintDirectoryRepository saintRepository;

    @Autowired
    private SpiritualPlaceRepository placeRepository;

    public Page<HeritageHistoryDto> getPaginatedHistory(String search, Integer page, Integer size, String sortBy, String direction) {
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<HeritageHistory> entities;
        if (search != null && !search.trim().isEmpty()) {
            entities = historyRepository.findByTitleContainingIgnoreCaseOrHeadingContainingIgnoreCase(search.trim(), search.trim(), pageable);
        } else {
            entities = historyRepository.findAll(pageable);
        }

        return entities.map(this::mapHistoryToDto);
    }

    public Page<KumbhHighlightDto> getPaginatedHighlights(String search, Integer page, Integer size, String sortBy, String direction) {
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "displayOrder" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "asc" : direction;

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<KumbhHighlight> entities;
        if (search != null && !search.trim().isEmpty()) {
            entities = highlightRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrYearContainingIgnoreCase(
                    search.trim(), search.trim(), search.trim(), pageable);
        } else {
            entities = highlightRepository.findAll(pageable);
        }

        return entities.map(this::mapHighlightToDto);
    }

    public Page<SaintDirectoryDto> getPaginatedSaints(String search, Integer page, Integer size, String sortBy, String direction) {
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "displayOrder" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "asc" : direction;

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<SaintDirectory> entities;
        if (search != null && !search.trim().isEmpty()) {
            entities = saintRepository.findByNameContainingIgnoreCaseOrAkhadaContainingIgnoreCaseOrRoleContainingIgnoreCase(
                    search.trim(), search.trim(), search.trim(), pageable);
        } else {
            entities = saintRepository.findAll(pageable);
        }

        return entities.map(this::mapSaintToDto);
    }

    public Page<SpiritualPlaceDto> getPaginatedPlaces(String search, Integer page, Integer size, String sortBy, String direction) {
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "displayOrder" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "asc" : direction;

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<SpiritualPlace> entities;
        if (search != null && !search.trim().isEmpty()) {
            entities = placeRepository.findByPlaceNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                    search.trim(), search.trim(), pageable);
        } else {
            entities = placeRepository.findAll(pageable);
        }

        return entities.map(this::mapPlaceToDto);
    }

    private HeritageHistoryDto mapHistoryToDto(HeritageHistory entity) {
        HeritageHistoryDto dto = new HeritageHistoryDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    private KumbhHighlightDto mapHighlightToDto(KumbhHighlight entity) {
        KumbhHighlightDto dto = new KumbhHighlightDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    private SaintDirectoryDto mapSaintToDto(SaintDirectory entity) {
        SaintDirectoryDto dto = new SaintDirectoryDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    private SpiritualPlaceDto mapPlaceToDto(SpiritualPlace entity) {
        SpiritualPlaceDto dto = new SpiritualPlaceDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }
}
