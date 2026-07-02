package com.kumbh.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_tracking")
public class DeliveryTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id")
    private Long shopOrderId;

    private String currentStatus;
    private String currentLocation;
    @Column(name = "courier_partner")
    private String courierPartner;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "latest_update", columnDefinition = "TEXT")
    private String latestUpdate;
    private LocalDateTime expectedDeliveryDate;

    private String updatedByOperator;
    private LocalDateTime updatedAt;

    public DeliveryTracking() {}

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getShopOrderId() { return shopOrderId; }
    public void setShopOrderId(Long shopOrderId) { this.shopOrderId = shopOrderId; }

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
