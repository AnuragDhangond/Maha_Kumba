package com.kumbh.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import com.kumbh.validation.FutureOrPresentDate;
import com.kumbh.validation.ValidIndianMobile;
import com.kumbh.validation.ValidName;

public class PoojaBookingDTO {
    private Long id;
    private Long acharyaId;
    private Long poojaId;
    private String acharyaName;
    private String poojaName;
    private String poojaDuration;
    private Double price;

    @NotBlank(message = "Devotee Name is required")
    @ValidName
    @Size(min = 2, max = 100, message = "Devotee Name must be between 2 and 100 characters")
    private String devoteeName;

    @Size(max = 50, message = "Gotra cannot exceed 50 characters")
    private String gotra;

    @NotBlank(message = "Purpose of Pooja is required")
    @Size(min = 5, max = 500, message = "Purpose must be between 5 and 500 characters")
    private String sankalpa;

    @NotNull(message = "Family count is required")
    @Min(value = 1, message = "Family members must be at least 1")
    @Max(value = 25, message = "Family members cannot exceed 25")
    private Integer familyCount;

    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String location;

    @NotBlank(message = "Preferred Date is required")
    @FutureOrPresentDate
    private String preferredDate;

    @NotBlank(message = "Preferred Time Slot is required")
    private String preferredSlot;

    private String status;
    
    @NotBlank(message = "Mobile number is required")
    @ValidIndianMobile
    private String mobileNumber;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String createdAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAcharyaId() { return acharyaId; }
    public void setAcharyaId(Long acharyaId) { this.acharyaId = acharyaId; }
    public Long getPoojaId() { return poojaId; }
    public void setPoojaId(Long poojaId) { this.poojaId = poojaId; }
    public String getAcharyaName() { return acharyaName; }
    public void setAcharyaName(String acharyaName) { this.acharyaName = acharyaName; }
    public String getPoojaName() { return poojaName; }
    public void setPoojaName(String poojaName) { this.poojaName = poojaName; }
    public String getPoojaDuration() { return poojaDuration; }
    public void setPoojaDuration(String poojaDuration) { this.poojaDuration = poojaDuration; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getDevoteeName() { return devoteeName; }
    public void setDevoteeName(String devoteeName) { this.devoteeName = devoteeName; }
    public String getGotra() { return gotra; }
    public void setGotra(String gotra) { this.gotra = gotra; }
    public String getSankalpa() { return sankalpa; }
    public void setSankalpa(String sankalpa) { this.sankalpa = sankalpa; }
    public Integer getFamilyCount() { return familyCount; }
    public void setFamilyCount(Integer familyCount) { this.familyCount = familyCount; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getPreferredDate() { return preferredDate; }
    public void setPreferredDate(String preferredDate) { this.preferredDate = preferredDate; }
    public String getPreferredSlot() { return preferredSlot; }
    public void setPreferredSlot(String preferredSlot) { this.preferredSlot = preferredSlot; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
