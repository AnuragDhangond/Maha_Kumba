package com.kumbh.controller;

import com.kumbh.dto.HeritageHistoryDto;
import com.kumbh.dto.KumbhHighlightDto;
import com.kumbh.dto.SaintDirectoryDto;
import com.kumbh.dto.SpiritualPlaceDto;
import com.kumbh.service.HeritageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/admin/heritage")
public class AdminHeritageController {

    @Autowired
    private HeritageService heritageService;

    // --- Heritage History ---
    @PostMapping("/history")
    public ResponseEntity<HeritageHistoryDto> createHistory(
            @Valid @RequestPart("history") HeritageHistoryDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(heritageService.createHistory(dto, image));
    }

    @PutMapping("/history/{id}")
    public ResponseEntity<HeritageHistoryDto> updateHistory(
            @PathVariable Long id,
            @Valid @RequestPart("history") HeritageHistoryDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(heritageService.updateHistory(id, dto, image));
    }

    @GetMapping("/history")
    public ResponseEntity<Page<HeritageHistoryDto>> getAllHistory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return ResponseEntity.ok(heritageService.getPaginatedHistory(search, page, size, sortBy, direction));
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long id) {
        heritageService.deleteHistory(id);
        return ResponseEntity.ok().build();
    }

    // --- Kumbh Highlights ---
    @PostMapping("/highlights")
    public ResponseEntity<KumbhHighlightDto> createHighlight(
            @Valid @RequestPart("highlight") KumbhHighlightDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(heritageService.createHighlight(dto, image));
    }

    @PutMapping("/highlights/{id}")
    public ResponseEntity<KumbhHighlightDto> updateHighlight(
            @PathVariable Long id,
            @Valid @RequestPart("highlight") KumbhHighlightDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(heritageService.updateHighlight(id, dto, image));
    }

    @GetMapping("/highlights")
    public ResponseEntity<Page<KumbhHighlightDto>> getAllHighlights(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return ResponseEntity.ok(heritageService.getPaginatedHighlights(search, page, size, sortBy, direction));
    }

    @DeleteMapping("/highlights/{id}")
    public ResponseEntity<Void> deleteHighlight(@PathVariable Long id) {
        heritageService.deleteHighlight(id);
        return ResponseEntity.ok().build();
    }

    // --- Saints Directory ---
    @PostMapping("/saints")
    public ResponseEntity<SaintDirectoryDto> createSaint(
            @Valid @RequestPart("saint") SaintDirectoryDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(heritageService.createSaint(dto, image));
    }

    @PutMapping("/saints/{id}")
    public ResponseEntity<SaintDirectoryDto> updateSaint(
            @PathVariable Long id,
            @Valid @RequestPart("saint") SaintDirectoryDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(heritageService.updateSaint(id, dto, image));
    }

    @GetMapping("/saints")
    public ResponseEntity<Page<SaintDirectoryDto>> getAllSaints(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return ResponseEntity.ok(heritageService.getPaginatedSaints(search, page, size, sortBy, direction));
    }

    @DeleteMapping("/saints/{id}")
    public ResponseEntity<Void> deleteSaint(@PathVariable Long id) {
        heritageService.deleteSaint(id);
        return ResponseEntity.ok().build();
    }

    // --- Spiritual Places ---
    @PostMapping("/places")
    public ResponseEntity<SpiritualPlaceDto> createPlace(
            @Valid @RequestPart("place") SpiritualPlaceDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(heritageService.createPlace(dto, image));
    }

    @PutMapping("/places/{id}")
    public ResponseEntity<SpiritualPlaceDto> updatePlace(
            @PathVariable Long id,
            @Valid @RequestPart("place") SpiritualPlaceDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(heritageService.updatePlace(id, dto, image));
    }

    @GetMapping("/places")
    public ResponseEntity<Page<SpiritualPlaceDto>> getAllPlaces(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return ResponseEntity.ok(heritageService.getPaginatedPlaces(search, page, size, sortBy, direction));
    }

    @DeleteMapping("/places/{id}")
    public ResponseEntity<Void> deletePlace(@PathVariable Long id) {
        heritageService.deletePlace(id);
        return ResponseEntity.ok().build();
    }
}
