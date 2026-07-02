package com.kumbh.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "donation_configs")
public class DonationConfig extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String heroTitle;
    private String heroSubtitle;
    private String plannerTitle;
    @Column(columnDefinition = "TEXT")
    private String plannerDescription;
    private String donationSectionTitle;
    private String presetAmounts;
    private Integer giftEligibilityAmount;
    private String giftTitle;
    private String giftDescription;
    private String upiId;
    private String upiName;
    private String paymentMethods;

    public DonationConfig() {
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
