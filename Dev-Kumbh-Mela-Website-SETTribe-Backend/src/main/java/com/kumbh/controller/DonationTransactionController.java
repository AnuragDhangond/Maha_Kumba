package com.kumbh.controller;

import com.kumbh.dto.DonationTransactionDto;
import com.kumbh.entity.DonationTransaction;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.service.DonationTransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/donations")
public class DonationTransactionController {

    @Autowired
    private DonationTransactionService service;

    @PostMapping
    public ResponseEntity<DonationTransactionDto> submitDonation(@Valid @RequestBody DonationTransactionDto dto) {
        DonationTransaction donation = EntityDtoMapper.toDonationTransactionEntity(dto);
        DonationTransaction saved = service.createDonation(donation);
        return ResponseEntity.ok(EntityDtoMapper.toDonationTransactionDto(saved));
    }

    @GetMapping
    public ResponseEntity<Page<DonationTransactionDto>> getAllDonations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return ResponseEntity.ok(service.getPaginatedDonations(search, page, size, sortBy, direction));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<DonationTransactionDto> verifyDonation(@PathVariable Long id) {
        DonationTransaction verified = service.verifyDonation(id);
        return ResponseEntity.ok(EntityDtoMapper.toDonationTransactionDto(verified));
    }
}
