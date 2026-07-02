package com.kumbh.controller;

import com.kumbh.dto.HeritageHistoryDto;
import com.kumbh.dto.KumbhHighlightDto;
import com.kumbh.dto.SaintDirectoryDto;
import com.kumbh.dto.SpiritualPlaceDto;
import com.kumbh.service.HeritageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/heritage")
public class PublicHeritageController {

    @Autowired
    private HeritageService heritageService;

    @GetMapping("/history")
    public ResponseEntity<List<HeritageHistoryDto>> getActiveHistory() {
        return ResponseEntity.ok(heritageService.getActiveHistory());
    }

    @GetMapping("/highlights")
    public ResponseEntity<List<KumbhHighlightDto>> getActiveHighlights() {
        return ResponseEntity.ok(heritageService.getActiveHighlights());
    }

    @GetMapping("/saints")
    public ResponseEntity<List<SaintDirectoryDto>> getActiveSaints() {
        return ResponseEntity.ok(heritageService.getActiveSaints());
    }

    @GetMapping("/places")
    public ResponseEntity<List<SpiritualPlaceDto>> getActivePlaces() {
        return ResponseEntity.ok(heritageService.getActivePlaces());
    }
}
