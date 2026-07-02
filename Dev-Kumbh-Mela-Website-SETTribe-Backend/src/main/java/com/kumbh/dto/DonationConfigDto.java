package com.kumbh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class DonationConfigDto {

    private Long id;
    private String heroTitle;
    private String heroSubtitle;
    private String plannerTitle;
    private String plannerDescription;
    private String donationSectionTitle;
    private String presetAmounts;

    @NotNull(message = "Gift eligibility amount is required")
    @Min(value = 1, message = "Gift eligibility amount must be at least 1")
    private Integer giftEligibilityAmount;

    private String giftTitle;
    private String giftDescription;

    @NotBlank(message = "UPI ID is required")
    private String upiId;

    @NotBlank(message = "UPI Name is required")
    private String upiName;
    private String paymentMethods;

    public DonationConfigDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHeroTitle() {
        return heroTitle;
    }

    public void setHeroTitle(String heroTitle) {
        this.heroTitle = heroTitle;
    }

    public String getHeroSubtitle() {
        return heroSubtitle;
    }

    public void setHeroSubtitle(String heroSubtitle) {
        this.heroSubtitle = heroSubtitle;
    }

    public String getPlannerTitle() {
        return plannerTitle;
    }

    public void setPlannerTitle(String plannerTitle) {
        this.plannerTitle = plannerTitle;
    }

    public String getPlannerDescription() {
        return plannerDescription;
    }

    public void setPlannerDescription(String plannerDescription) {
        this.plannerDescription = plannerDescription;
    }

    public String getDonationSectionTitle() {
        return donationSectionTitle;
    }

    public void setDonationSectionTitle(String donationSectionTitle) {
        this.donationSectionTitle = donationSectionTitle;
    }

    public String getPresetAmounts() {
        return presetAmounts;
    }

    public void setPresetAmounts(String presetAmounts) {
        this.presetAmounts = presetAmounts;
    }

    public Integer getGiftEligibilityAmount() {
        return giftEligibilityAmount;
    }

    public void setGiftEligibilityAmount(Integer giftEligibilityAmount) {
        this.giftEligibilityAmount = giftEligibilityAmount;
    }

    public String getGiftTitle() {
        return giftTitle;
    }

    public void setGiftTitle(String giftTitle) {
        this.giftTitle = giftTitle;
    }

    public String getGiftDescription() {
        return giftDescription;
    }

    public void setGiftDescription(String giftDescription) {
        this.giftDescription = giftDescription;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public String getUpiName() {
        return upiName;
    }

    public void setUpiName(String upiName) {
        this.upiName = upiName;
    }

    public String getPaymentMethods() {
        return paymentMethods;
    }

    public void setPaymentMethods(String paymentMethods) {
        this.paymentMethods = paymentMethods;
    }
}
