package com.kumbh.dto;

public class SystemConfigDto {
    private Long id;
    private String siteName;
    private Boolean maintenanceMode;
    private Boolean publicRegistration;
    private Boolean emailNotifications;
    private Boolean smsAlerts;
    private Boolean autoBackup;
    private Boolean highSecurityMfa;
    private String defaultTheme;
    private String supportEmail;
    private String supportPhone;

    public SystemConfigDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSiteName() {
        return siteName;
    }

    public void setSiteName(String siteName) {
        this.siteName = siteName;
    }

    public Boolean getMaintenanceMode() {
        return maintenanceMode;
    }

    public void setMaintenanceMode(Boolean maintenanceMode) {
        this.maintenanceMode = maintenanceMode;
    }

    public Boolean getPublicRegistration() {
        return publicRegistration;
    }

    public void setPublicRegistration(Boolean publicRegistration) {
        this.publicRegistration = publicRegistration;
    }

    public Boolean getEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(Boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public Boolean getSmsAlerts() {
        return smsAlerts;
    }

    public void setSmsAlerts(Boolean smsAlerts) {
        this.smsAlerts = smsAlerts;
    }

    public Boolean getAutoBackup() {
        return autoBackup;
    }

    public void setAutoBackup(Boolean autoBackup) {
        this.autoBackup = autoBackup;
    }

    public Boolean getHighSecurityMfa() {
        return highSecurityMfa;
    }

    public void setHighSecurityMfa(Boolean highSecurityMfa) {
        this.highSecurityMfa = highSecurityMfa;
    }

    public String getDefaultTheme() {
        return defaultTheme;
    }

    public void setDefaultTheme(String defaultTheme) {
        this.defaultTheme = defaultTheme;
    }

    public String getSupportEmail() {
        return supportEmail;
    }

    public void setSupportEmail(String supportEmail) {
        this.supportEmail = supportEmail;
    }

    public String getSupportPhone() {
        return supportPhone;
    }

    public void setSupportPhone(String supportPhone) {
        this.supportPhone = supportPhone;
    }
}
