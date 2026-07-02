package com.kumbh.service;

import com.kumbh.dto.HeritageHistoryDto;
import com.kumbh.dto.KumbhHighlightDto;
import com.kumbh.dto.SaintDirectoryDto;
import com.kumbh.dto.SpiritualPlaceDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface HeritageService {

    // Heritage History
    HeritageHistoryDto createHistory(HeritageHistoryDto dto, MultipartFile image);
    HeritageHistoryDto updateHistory(Long id, HeritageHistoryDto dto, MultipartFile image);
    HeritageHistoryDto getHistoryById(Long id);
    Page<HeritageHistoryDto> getAllHistory(Pageable pageable, String search);
    List<HeritageHistoryDto> getActiveHistory();
    void deleteHistory(Long id);

    // Kumbh Highlights
    KumbhHighlightDto createHighlight(KumbhHighlightDto dto, MultipartFile image);
    KumbhHighlightDto updateHighlight(Long id, KumbhHighlightDto dto, MultipartFile image);
    KumbhHighlightDto getHighlightById(Long id);
    Page<KumbhHighlightDto> getAllHighlights(Pageable pageable, String search);
    List<KumbhHighlightDto> getActiveHighlights();
    void deleteHighlight(Long id);

    // Saints Directory
    SaintDirectoryDto createSaint(SaintDirectoryDto dto, MultipartFile image);
    SaintDirectoryDto updateSaint(Long id, SaintDirectoryDto dto, MultipartFile image);
    SaintDirectoryDto getSaintById(Long id);
    Page<SaintDirectoryDto> getAllSaints(Pageable pageable, String search);
    List<SaintDirectoryDto> getActiveSaints();
    void deleteSaint(Long id);

    // Spiritual Places
    SpiritualPlaceDto createPlace(SpiritualPlaceDto dto, MultipartFile image);
    SpiritualPlaceDto updatePlace(Long id, SpiritualPlaceDto dto, MultipartFile image);
    SpiritualPlaceDto getPlaceById(Long id);
    Page<SpiritualPlaceDto> getAllPlaces(Pageable pageable, String search);
    List<SpiritualPlaceDto> getActivePlaces();
    
    // Pagination specific methods
    Page<HeritageHistoryDto> getPaginatedHistory(String search, Integer page, Integer size, String sortBy, String direction);
    Page<KumbhHighlightDto> getPaginatedHighlights(String search, Integer page, Integer size, String sortBy, String direction);
    Page<SaintDirectoryDto> getPaginatedSaints(String search, Integer page, Integer size, String sortBy, String direction);
    Page<SpiritualPlaceDto> getPaginatedPlaces(String search, Integer page, Integer size, String sortBy, String direction);
    void deletePlace(Long id);
}
