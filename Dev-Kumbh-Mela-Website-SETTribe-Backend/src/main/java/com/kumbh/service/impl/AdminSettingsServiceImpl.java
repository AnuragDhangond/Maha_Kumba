package com.kumbh.service.impl;

import com.kumbh.entity.AdminSettings;
import com.kumbh.repository.AdminSettingsRepository;
import com.kumbh.service.AdminSettingsService;
import org.springframework.stereotype.Service;

@Service
public class AdminSettingsServiceImpl implements AdminSettingsService {

    private final AdminSettingsRepository repository;

    public AdminSettingsServiceImpl(AdminSettingsRepository repository) {
        this.repository = repository;
    }

    @Override
    public AdminSettings getSettings() {
        return repository.findById(1L).orElseGet(() -> {
            AdminSettings defaultSettings = new AdminSettings();
            return repository.save(defaultSettings);
        });
    }

    @Override
    public AdminSettings updateSettings(AdminSettings settings) {
        settings.setId(1L); // Ensure we only ever have one settings record
        return repository.save(settings);
    }
}
