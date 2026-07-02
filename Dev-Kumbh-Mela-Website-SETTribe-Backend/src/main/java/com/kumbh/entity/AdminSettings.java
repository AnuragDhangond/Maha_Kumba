package com.kumbh.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "admin_settings")

public class AdminSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean systemNotifications = true;
    private boolean maintenanceMode = false;
    private boolean publicRegistration = true;
    private boolean autoBackup = true;
    private boolean highSecurity = false;
    private boolean realtimeLogs = true;
    private String theme = "light";

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isSystemNotifications() {
        return systemNotifications;
    }

    public void setSystemNotifications(boolean systemNotifications) {
        this.systemNotifications = systemNotifications;
    }

    public boolean isMaintenanceMode() {
        return maintenanceMode;
    }

    public void setMaintenanceMode(boolean maintenanceMode) {
        this.maintenanceMode = maintenanceMode;
    }

    public boolean isPublicRegistration() {
        return publicRegistration;
    }

    public void setPublicRegistration(boolean publicRegistration) {
        this.publicRegistration = publicRegistration;
    }

    public boolean isAutoBackup() {
        return autoBackup;
    }

    public void setAutoBackup(boolean autoBackup) {
        this.autoBackup = autoBackup;
    }

    public boolean isHighSecurity() {
        return highSecurity;
    }

    public void setHighSecurity(boolean highSecurity) {
        this.highSecurity = highSecurity;
    }

    public boolean isRealtimeLogs() {
        return realtimeLogs;
    }

    public void setRealtimeLogs(boolean realtimeLogs) {
        this.realtimeLogs = realtimeLogs;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }
}
