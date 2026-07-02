package com.kumbh.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class VendorApplicationDto {

    private Long id;
    private Integer userId;

    // ── Applicant ─────────────────────────────────────────────────
    @NotBlank(message = "Full name is required")
    @com.kumbh.validation.ValidName
    private String fullName;

    @NotBlank(message = "Email is required")
    @com.kumbh.validation.ValidEmail
    private String email;

    @NotBlank(message = "Phone number is required")
    @com.kumbh.validation.ValidIndianMobile
    private String phone;

    @com.kumbh.validation.ValidIndianMobile
    private String whatsappNumber;

    // ── Shop ──────────────────────────────────────────────────────
    @NotBlank(message = "Shop name is required")
    @Size(min = 3, max = 150)
    private String shopName;

    @NotBlank(message = "Shop category is required")
    private String shopCategory;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String shopDescription;

    @NotBlank(message = "Address is required")
    private String address;

    private String city;
    private String state;

    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Enter a valid 6-digit pincode")
    private String pincode;

    private String landmark;
    private String gstNumber;

    // ── Location ──────────────────────────────────────────────────
    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String googleMapLink;
    private String openingTime;
    private String closingTime;

    // ── Uploaded file URLs (returned in response) ─────────────────
    private String documentUrl;
    private String shopLicenseUrl;
    private String logoImage;
    private String bannerImage;

    // ── Read-only workflow state ──────────────────────────────────
    private String applicationStatus;
    private String reviewerNotes;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private Long shopId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Getters & Setters ─────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }

    public String getShopCategory() { return shopCategory; }
    public void setShopCategory(String shopCategory) { this.shopCategory = shopCategory; }

    public String getShopDescription() { return shopDescription; }
    public void setShopDescription(String shopDescription) { this.shopDescription = shopDescription; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getGoogleMapLink() { return googleMapLink; }
    public void setGoogleMapLink(String googleMapLink) { this.googleMapLink = googleMapLink; }

    public String getOpeningTime() { return openingTime; }
    public void setOpeningTime(String openingTime) { this.openingTime = openingTime; }

    public String getClosingTime() { return closingTime; }
    public void setClosingTime(String closingTime) { this.closingTime = closingTime; }

    public String getDocumentUrl() { return documentUrl; }
    public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }

    public String getShopLicenseUrl() { return shopLicenseUrl; }
    public void setShopLicenseUrl(String shopLicenseUrl) { this.shopLicenseUrl = shopLicenseUrl; }

    public String getLogoImage() { return logoImage; }
    public void setLogoImage(String logoImage) { this.logoImage = logoImage; }

    public String getBannerImage() { return bannerImage; }
    public void setBannerImage(String bannerImage) { this.bannerImage = bannerImage; }

    public String getApplicationStatus() { return applicationStatus; }
    public void setApplicationStatus(String applicationStatus) { this.applicationStatus = applicationStatus; }

    public String getReviewerNotes() { return reviewerNotes; }
    public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public Long getShopId() { return shopId; }
    public void setShopId(Long shopId) { this.shopId = shopId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
