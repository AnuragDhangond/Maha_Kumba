package com.kumbh.controller;

import com.kumbh.dto.DonationConfigDto;
import com.kumbh.entity.DonationConfig;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.service.DonationConfigService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donation-config")
public class DonationConfigController {

    @Autowired
    private DonationConfigService service;

    @GetMapping
    public ResponseEntity<DonationConfigDto> getConfig() {
        DonationConfig config = service.getConfig();
        return ResponseEntity.ok(EntityDtoMapper.toDonationConfigDto(config));
    }

    @PutMapping
    public ResponseEntity<DonationConfigDto> updateConfig(@Valid @RequestBody DonationConfigDto configDto) {
        DonationConfig config = EntityDtoMapper.toDonationConfigEntity(configDto);
        DonationConfig updated = service.updateConfig(config);
        return ResponseEntity.ok(EntityDtoMapper.toDonationConfigDto(updated));
    }
}
