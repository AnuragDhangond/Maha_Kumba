package com.kumbh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

public class DeliveryTrackingDto {
    private Long id;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "Ordered|Processing|Shipped|Out for Delivery|Delivered", message = "Invalid status value")
    private String currentStatus;

    @NotBlank(message = "Current location is required")
    @Size(min = 3, max = 200, message = "Location must be between 3 and 200 characters")
    private String currentLocation;
    private String courierPartner;
    private String trackingNumber;
    private String latestUpdate;

    @NotNull(message = "Expected delivery date is required")
    @com.kumbh.validation.FutureOrPresentDate
    private LocalDateTime expectedDeliveryDate;
    private String updatedByOperator;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public String getCourierPartner() { return courierPartner; }
    public void setCourierPartner(String courierPartner) { this.courierPartner = courierPartner; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getLatestUpdate() { return latestUpdate; }
    public void setLatestUpdate(String latestUpdate) { this.latestUpdate = latestUpdate; }

    public LocalDateTime getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDateTime expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }

    public String getUpdatedByOperator() { return updatedByOperator; }
    public void setUpdatedByOperator(String updatedByOperator) { this.updatedByOperator = updatedByOperator; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
