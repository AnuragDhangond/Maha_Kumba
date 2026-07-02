package com.kumbh.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_addresses")
public class UserAddress extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String pincode;

    @Column(name = "house_no", nullable = false)
    private String houseNo;

    @Column(nullable = false)
    private String area;

    private String landmark;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(name = "state_code", nullable = false)
    private String stateCode;

    @Column(name = "city_village", nullable = false)
    private String cityVillage;

    @Column(name = "address_type", nullable = false)
    private String addressType = "Home"; // e.g. Home, Work

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    // Constructors
    public UserAddress() {
        super();
    }

    public UserAddress(Integer id, User user, String name, String phone, String pincode, String houseNo, String area, String landmark, String city, String state, String stateCode, String cityVillage, String addressType, Boolean isDefault) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.phone = phone;
        this.pincode = pincode;
        this.houseNo = houseNo;
        this.area = area;
        this.landmark = landmark;
        this.city = city;
        this.state = state;
        this.stateCode = stateCode;
        this.cityVillage = cityVillage;
        this.addressType = addressType;
        this.isDefault = isDefault;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getHouseNo() {
        return houseNo;
    }

    public void setHouseNo(String houseNo) {
        this.houseNo = houseNo;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public String getLandmark() {
        return landmark;
    }

    public void setLandmark(String landmark) {
        this.landmark = landmark;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getStateCode() {
        return stateCode;
    }

    public void setStateCode(String stateCode) {
        this.stateCode = stateCode;
    }

    public String getCityVillage() {
        return cityVillage;
    }

    public void setCityVillage(String cityVillage) {
        this.cityVillage = cityVillage;
    }

    public String getAddressType() {
        return addressType;
    }

    public void setAddressType(String addressType) {
        this.addressType = addressType;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean default1) {
        isDefault = default1;
    }
}
