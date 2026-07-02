package com.kumbh.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * VendorApplication — captures a normal user's request to become a verified vendor.
 * Follows the Swiggy/Zomato-style moderated onboarding flow:
 * USER → VENDOR_PENDING (after submit) → VENDOR (after approval)
 *
 * Status lifecycle:
 *   PENDING → UNDER_REVIEW → APPROVED | REJECTED | CHANGES_REQUESTED
 */
@Entity
@Table(name = "vendor_applications",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id"}))
public class VendorApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;

    // ── Applicant personal details ───────────────────────────────
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(name = "whatsapp_number")
    private String whatsappNumber;

    // ── Shop details submitted in application ────────────────────
    @Column(name = "shop_name", nullable = false)
    private String shopName;

    @Column(name = "shop_category", nullable = false)
    private String shopCategory;

    @Column(name = "shop_description", columnDefinition = "TEXT")
    private String shopDescription;

    @Column(nullable = false)
    private String address;

    private String city;
    private String state;
    private String pincode;
    private String landmark;

    @Column(name = "gst_number")
    private String gstNumber;

    private Double latitude;
    private Double longitude;

    @Column(name = "google_map_link")
    private String googleMapLink;

    @Column(name = "opening_time")
    private String openingTime = "09:00";

    @Column(name = "closing_time")
    private String closingTime = "21:00";

    // ── Uploaded document URLs (Cloudinary/S3 or local) ─────────
    @Column(name = "document_url")
    private String documentUrl;       // Aadhaar / PAN

    @Column(name = "shop_license_url")
    private String shopLicenseUrl;    // Trade/Shop License

    @Column(name = "logo_image")
    private String logoImage;

    @Column(name = "banner_image")
    private String bannerImage;

    // ── Workflow state ───────────────────────────────────────────
    /**
     * PENDING | UNDER_REVIEW | APPROVED | REJECTED | CHANGES_REQUESTED
     */
    @Column(name = "application_status", nullable = false)
    private String applicationStatus = "PENDING";

    @Column(name = "reviewer_notes", columnDefinition = "TEXT")
    private String reviewerNotes;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    /** Populated after approval — links to the auto-created shop */
    @Column(name = "shop_id")
    private Long shopId;

    // ── Constructors ─────────────────────────────────────────────
    public VendorApplication() {}

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
}
