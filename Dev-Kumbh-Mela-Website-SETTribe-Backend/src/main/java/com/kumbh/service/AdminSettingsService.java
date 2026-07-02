package com.kumbh.service;

import com.kumbh.entity.AdminSettings;

public interface AdminSettingsService {
    AdminSettings getSettings();
    AdminSettings updateSettings(AdminSettings settings);
}
