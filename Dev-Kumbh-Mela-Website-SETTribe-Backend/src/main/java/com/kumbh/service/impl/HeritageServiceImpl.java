package com.kumbh.service.impl;

import com.kumbh.dto.*;
import com.kumbh.entity.*;
import com.kumbh.repository.*;
import com.kumbh.service.HeritageService;
import com.kumbh.pagination.HeritagePagination;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HeritageServiceImpl implements HeritageService {

    @Autowired
    private HeritageHistoryRepository historyRepository;

    @Autowired
    private KumbhHighlightRepository highlightRepository;

    @Autowired
    private SaintDirectoryRepository saintRepository;

    @Autowired
    private SpiritualPlaceRepository placeRepository;

    @Autowired
    private HeritagePagination pagination;

    private final String UPLOAD_DIR = "uploads/";

    private String saveImage(MultipartFile image) {
        if (image == null || image.isEmpty()) return null;
        
        String originalFilename = image.getOriginalFilename();
        if (originalFilename != null) {
            String lower = originalFilename.toLowerCase();
            if (!(lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp"))) {
                throw new RuntimeException("Invalid file format. Only JPG, PNG, and WebP are allowed.");
            }
        }

        try {
            String filename = UUID.randomUUID().toString() + "_" + originalFilename;
            Path path = Paths.get(UPLOAD_DIR + filename);
            Files.createDirectories(path.getParent());
            Files.copy(image.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store image", e);
        }
    }

    // --- Heritage History ---

    @Override
    public HeritageHistoryDto createHistory(HeritageHistoryDto dto, MultipartFile image) {
        HeritageHistory entity = new HeritageHistory();
        BeanUtils.copyProperties(dto, entity, "id", "createdAt", "updatedAt");
        
        if (image != null && !image.isEmpty()) {
            entity.setBackgroundImage(saveImage(image));
        }
        
        entity = historyRepository.save(entity);
        return mapToDto(entity);
    }

    @Override
    public HeritageHistoryDto updateHistory(Long id, HeritageHistoryDto dto, MultipartFile image) {
        HeritageHistory entity = historyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("History not found"));
        BeanUtils.copyProperties(dto, entity, "id", "createdAt", "updatedAt", "backgroundImage");
        
        if (image != null && !image.isEmpty()) {
            entity.setBackgroundImage(saveImage(image));
        }
        
        entity = historyRepository.save(entity);
        return mapToDto(entity);
    }

    @Override
    public HeritageHistoryDto getHistoryById(Long id) {
        HeritageHistory entity = historyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("History not found"));
        return mapToDto(entity);
    }

    @Override
    public Page<HeritageHistoryDto> getAllHistory(Pageable pageable, String search) {
        Page<HeritageHistory> entities;
        if (search != null && !search.isEmpty()) {
            entities = historyRepository.findByTitleContainingIgnoreCaseOrHeadingContainingIgnoreCase(search, search, pageable);
        } else {
            entities = historyRepository.findAll(pageable);
        }
        return entities.map(this::mapToDto);
    }

    @Override
    public Page<HeritageHistoryDto> getPaginatedHistory(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedHistory(search, page, size, sortBy, direction);
    }

    @Override
    public List<HeritageHistoryDto> getActiveHistory() {
        return historyRepository.findByStatus("ACTIVE").stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public void deleteHistory(Long id) {
        historyRepository.deleteById(id);
    }

    private HeritageHistoryDto mapToDto(HeritageHistory entity) {
        HeritageHistoryDto dto = new HeritageHistoryDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    // --- Kumbh Highlights ---

    @Override
    public KumbhHighlightDto createHighlight(KumbhHighlightDto dto, MultipartFile image) {
        KumbhHighlight entity = new KumbhHighlight();
        BeanUtils.copyProperties(dto, entity, "id", "createdAt", "updatedAt");
        
        if (image != null && !image.isEmpty()) {
            entity.setThumbnailImage(saveImage(image));
        }
        
        entity = highlightRepository.save(entity);
        return mapToDto(entity);
    }

    @Override
    public KumbhHighlightDto updateHighlight(Long id, KumbhHighlightDto dto, MultipartFile image) {
        KumbhHighlight entity = highlightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Highlight not found"));
        BeanUtils.copyProperties(dto, entity, "id", "createdAt", "updatedAt", "thumbnailImage");
        
        if (image != null && !image.isEmpty()) {
            entity.setThumbnailImage(saveImage(image));
        }
        
        entity = highlightRepository.save(entity);
        return mapToDto(entity);
    }

    @Override
    public KumbhHighlightDto getHighlightById(Long id) {
        KumbhHighlight entity = highlightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Highlight not found"));
        return mapToDto(entity);
    }

    @Override
    public Page<KumbhHighlightDto> getAllHighlights(Pageable pageable, String search) {
        Page<KumbhHighlight> entities;
        if (search != null && !search.isEmpty()) {
            entities = highlightRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrYearContainingIgnoreCase(
                    search, search, search, pageable);
        } else {
            entities = highlightRepository.findAll(pageable);
        }
        return entities.map(this::mapToDto);
    }

    @Override
    public Page<KumbhHighlightDto> getPaginatedHighlights(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedHighlights(search, page, size, sortBy, direction);
    }

    @Override
    public List<KumbhHighlightDto> getActiveHighlights() {
        return highlightRepository.findByStatusOrderByDisplayOrderAsc("ACTIVE").stream().map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteHighlight(Long id) {
        highlightRepository.deleteById(id);
    }

    private KumbhHighlightDto mapToDto(KumbhHighlight entity) {
        KumbhHighlightDto dto = new KumbhHighlightDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    // --- Saints Directory ---

    @Override
    public SaintDirectoryDto createSaint(SaintDirectoryDto dto, MultipartFile image) {
        SaintDirectory entity = new SaintDirectory();
        BeanUtils.copyProperties(dto, entity, "id", "createdAt", "updatedAt");
        
        if (image != null && !image.isEmpty()) {
            entity.setImage(saveImage(image));
        }
        
        entity = saintRepository.save(entity);
        return mapToDto(entity);
    }

    @Override
    public SaintDirectoryDto updateSaint(Long id, SaintDirectoryDto dto, MultipartFile image) {
        SaintDirectory entity = saintRepository.findById(id).orElseThrow(() -> new RuntimeException("Saint not found"));
        BeanUtils.copyProperties(dto, entity, "id", "createdAt", "updatedAt", "image");
        
        if (image != null && !image.isEmpty()) {
            entity.setImage(saveImage(image));
        }
        
        entity = saintRepository.save(entity);
        return mapToDto(entity);
    }

    @Override
    public SaintDirectoryDto getSaintById(Long id) {
        SaintDirectory entity = saintRepository.findById(id).orElseThrow(() -> new RuntimeException("Saint not found"));
        return mapToDto(entity);
    }

    @Override
    public Page<SaintDirectoryDto> getAllSaints(Pageable pageable, String search) {
        Page<SaintDirectory> entities;
        if (search != null && !search.isEmpty()) {
            entities = saintRepository.findByNameContainingIgnoreCaseOrAkhadaContainingIgnoreCaseOrRoleContainingIgnoreCase(
                    search, search, search, pageable);
        } else {
            entities = saintRepository.findAll(pageable);
        }
        return entities.map(this::mapToDto);
    }

    @Override
    public Page<SaintDirectoryDto> getPaginatedSaints(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedSaints(search, page, size, sortBy, direction);
    }

    @Override
    public List<SaintDirectoryDto> getActiveSaints() {
        return saintRepository.findByStatusOrderByDisplayOrderAsc("ACTIVE").stream().map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteSaint(Long id) {
        saintRepository.deleteById(id);
    }

    private SaintDirectoryDto mapToDto(SaintDirectory entity) {
        SaintDirectoryDto dto = new SaintDirectoryDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    // --- Spiritual Places ---

    @Override
    public SpiritualPlaceDto createPlace(SpiritualPlaceDto dto, MultipartFile image) {
        SpiritualPlace entity = new SpiritualPlace();
        BeanUtils.copyProperties(dto, entity, "id", "createdAt", "updatedAt");
        
        if (image != null && !image.isEmpty()) {
            entity.setImage(saveImage(image));
        }
        
        entity = placeRepository.save(entity);
        return mapToDto(entity);
    }

    @Override
    public SpiritualPlaceDto updatePlace(Long id, SpiritualPlaceDto dto, MultipartFile image) {
        SpiritualPlace entity = placeRepository.findById(id).orElseThrow(() -> new RuntimeException("Place not found"));
        BeanUtils.copyProperties(dto, entity, "id", "createdAt", "updatedAt", "image");
        
        if (image != null && !image.isEmpty()) {
            entity.setImage(saveImage(image));
        }
        
        entity = placeRepository.save(entity);
        return mapToDto(entity);
    }

    @Override
    public SpiritualPlaceDto getPlaceById(Long id) {
        SpiritualPlace entity = placeRepository.findById(id).orElseThrow(() -> new RuntimeException("Place not found"));
        return mapToDto(entity);
    }

    @Override
    public Page<SpiritualPlaceDto> getAllPlaces(Pageable pageable, String search) {
        Page<SpiritualPlace> entities;
        if (search != null && !search.isEmpty()) {
            entities = placeRepository.findByPlaceNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                    search, search, pageable);
        } else {
            entities = placeRepository.findAll(pageable);
        }
        return entities.map(this::mapToDto);
    }

    @Override
    public Page<SpiritualPlaceDto> getPaginatedPlaces(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedPlaces(search, page, size, sortBy, direction);
    }

    @Override
    public List<SpiritualPlaceDto> getActivePlaces() {
        return placeRepository.findByStatusOrderByDisplayOrderAsc("ACTIVE").stream().map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deletePlace(Long id) {
        placeRepository.deleteById(id);
    }

    private SpiritualPlaceDto mapToDto(SpiritualPlace entity) {
        SpiritualPlaceDto dto = new SpiritualPlaceDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }
}
