package com.kumbh.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import com.kumbh.validation.ValidIndianMobile;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "travel_groups")
public class TravelGroup extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Group name is required")
    @Column(name = "group_name", nullable = false)
    private String groupName;

    @Size(max = 10, message = "Group code cannot exceed 10 characters")
    @Column(name = "group_code", nullable = false, unique = true, length = 10)
    private String groupCode;

    @NotBlank(message = "Source location is required")
    @Column(name = "source_location", nullable = false)
    private String sourceLocation;

    @NotBlank(message = "Destination location is required")
    @Column(name = "destination_location", nullable = false)
    private String destinationLocation = "Nashik";

    @NotNull(message = "Travel date is required")
    @FutureOrPresent(message = "Travel date must be today or in the future")
    @Column(name = "travel_date", nullable = false)
    private LocalDate travelDate;

    @Column(name = "travel_mode")
    private String travelMode; // Train, Bus, Car, Flight

    @NotBlank(message = "Contact number is required")
    @ValidIndianMobile
    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "max_members")
    private Integer maxMembers = 10;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    @Column(name = "rating")
    private Integer rating;

    @Column(nullable = false)
    private String status = "OPEN"; // OPEN, CLOSED

    @Column(name = "creator_id")
    private Long creatorId;

    @Column(name = "creator_name")
    private String creatorName;

    @Transient
    private Integer membersCount;

    @OneToMany(mappedBy = "travelGroup", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<TravelGroupMember> members = new ArrayList<>();

    public TravelGroup() {
        this.status = "OPEN";
        this.maxMembers = 10;
        this.destinationLocation = "Nashik";
    }

    public TravelGroup(Long id, String groupName, String groupCode, String sourceLocation, String destinationLocation, 
                       LocalDate travelDate, String travelMode, String contactNumber, Integer maxMembers, 
                       String description, Integer rating, String status, Long creatorId, String creatorName) {
        this.id = id;
        this.groupName = groupName;
        this.groupCode = groupCode;
        this.sourceLocation = sourceLocation;
        this.destinationLocation = destinationLocation;
        this.travelDate = travelDate;
        this.travelMode = travelMode;
        this.contactNumber = contactNumber;
        this.maxMembers = maxMembers;
        this.description = description;
        this.rating = rating;
        this.status = status;
        this.creatorId = creatorId;
        this.creatorName = creatorName;
    }

    // Getters and Setters...
    
    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getGroupCode() {
        return groupCode;
    }

    public void setGroupCode(String groupCode) {
        this.groupCode = groupCode;
    }

    public String getSourceLocation() {
        return sourceLocation;
    }

    public void setSourceLocation(String sourceLocation) {
        this.sourceLocation = sourceLocation;
    }

    public String getDestinationLocation() {
        return destinationLocation;
    }

    public void setDestinationLocation(String destinationLocation) {
        this.destinationLocation = destinationLocation;
    }

    public LocalDate getTravelDate() {
        return travelDate;
    }

    public void setTravelDate(LocalDate travelDate) {
        this.travelDate = travelDate;
    }

    public String getTravelMode() {
        return travelMode;
    }

    public void setTravelMode(String travelMode) {
        this.travelMode = travelMode;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public Integer getMaxMembers() {
        return maxMembers;
    }

    public void setMaxMembers(Integer maxMembers) {
        this.maxMembers = maxMembers;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Long creatorId) {
        this.creatorId = creatorId;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public void setCreatorName(String creatorName) {
        this.creatorName = creatorName;
    }

    public Integer getMembersCount() {
        return membersCount;
    }

    public void setMembersCount(Integer membersCount) {
        this.membersCount = membersCount;
    }

    public void setMembersCount(int membersCount) {
        this.membersCount = membersCount;
    }

    public List<TravelGroupMember> getMembers() {
        return members;
    }

    public void setMembers(List<TravelGroupMember> members) {
        this.members = members;
    }
}
