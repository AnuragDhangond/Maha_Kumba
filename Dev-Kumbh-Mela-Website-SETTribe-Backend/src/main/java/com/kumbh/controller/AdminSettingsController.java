package com.kumbh.controller;

import com.kumbh.entity.AdminSettings;
import com.kumbh.service.AdminSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    private final AdminSettingsService service;

    public AdminSettingsController(AdminSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<AdminSettings> getSettings() {
        return ResponseEntity.ok(service.getSettings());
    }

    @PutMapping
    public ResponseEntity<AdminSettings> updateSettings(@RequestBody AdminSettings settings) {
        return ResponseEntity.ok(service.updateSettings(settings));
    }
}
