package com.kumbh.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "pooja_bookings")
public class PoojaBooking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long acharyaId;

    private Long poojaId;

    @Column(nullable = false)
    private String acharyaName;

    @Column(nullable = false)
    private String poojaName;

    private String poojaDuration;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String devoteeName;

    private String gotra;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String sankalpa;

    private Integer familyCount;

    private String location;

    private String preferredDate;

    private String preferredSlot;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "mobile_number", nullable = false)
    private String mobileNumber;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAcharyaId() {
        return acharyaId;
    }

    public void setAcharyaId(Long acharyaId) {
        this.acharyaId = acharyaId;
    }

    public Long getPoojaId() {
        return poojaId;
    }

    public void setPoojaId(Long poojaId) {
        this.poojaId = poojaId;
    }

    public String getAcharyaName() {
        return acharyaName;
    }

    public void setAcharyaName(String acharyaName) {
        this.acharyaName = acharyaName;
    }

    public String getPoojaName() {
        return poojaName;
    }

    public void setPoojaName(String poojaName) {
        this.poojaName = poojaName;
    }

    public String getPoojaDuration() {
        return poojaDuration;
    }

    public void setPoojaDuration(String poojaDuration) {
        this.poojaDuration = poojaDuration;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getDevoteeName() {
        return devoteeName;
    }

    public void setDevoteeName(String devoteeName) {
        this.devoteeName = devoteeName;
    }

    public String getGotra() {
        return gotra;
    }

    public void setGotra(String gotra) {
        this.gotra = gotra;
    }

    public String getSankalpa() {
        return sankalpa;
    }

    public void setSankalpa(String sankalpa) {
        this.sankalpa = sankalpa;
    }

    public Integer getFamilyCount() {
        return familyCount;
    }

    public void setFamilyCount(Integer familyCount) {
        this.familyCount = familyCount;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPreferredDate() {
        return preferredDate;
    }

    public void setPreferredDate(String preferredDate) {
        this.preferredDate = preferredDate;
    }

    public String getPreferredSlot() {
        return preferredSlot;
    }

    public void setPreferredSlot(String preferredSlot) {
        this.preferredSlot = preferredSlot;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }
}
