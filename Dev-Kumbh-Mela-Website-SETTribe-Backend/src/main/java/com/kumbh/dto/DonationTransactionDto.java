package com.kumbh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import com.kumbh.validation.ValidName;
import com.kumbh.validation.ValidEmail;
import com.kumbh.validation.ValidIndianMobile;
import java.time.LocalDateTime;

public class DonationTransactionDto {

    private Long id;

    @NotBlank(message = "Donor name is required")
    @ValidName
    private String donorName;

    @NotBlank(message = "Donor email is required")
    @ValidEmail
    private String donorEmail;

    @NotBlank(message = "Donor phone is required")
    @ValidIndianMobile
    private String donorPhone;

    private String donorUPI;

    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least 1")
    private Double amount;

    private String transactionReference;
    private String status;
    private String message;
    private LocalDateTime createdAt;

    public DonationTransactionDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDonorName() {
        return donorName;
    }

    public void setDonorName(String donorName) {
        this.donorName = donorName;
    }

    public String getDonorEmail() {
        return donorEmail;
    }

    public void setDonorEmail(String donorEmail) {
        this.donorEmail = donorEmail;
    }

    public String getDonorPhone() {
        return donorPhone;
    }

    public void setDonorPhone(String donorPhone) {
        this.donorPhone = donorPhone;
    }

    public String getDonorUPI() {
        return donorUPI;
    }

    public void setDonorUPI(String donorUPI) {
        this.donorUPI = donorUPI;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
