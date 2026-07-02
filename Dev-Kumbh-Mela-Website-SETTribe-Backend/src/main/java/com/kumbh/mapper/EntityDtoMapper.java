package com.kumbh.mapper;

import com.kumbh.dto.*;
import com.kumbh.entity.*;

public class EntityDtoMapper {

    // --- User Mapping ---
    public static UserDto toUserDto(User entity) {
        if (entity == null) return null;
        UserDto dto = new UserDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());
        dto.setAddress(entity.getAddress());
        dto.setCreatedDate(entity.getCreatedAt());
        dto.setUpdatedDate(entity.getUpdatedAt());
        dto.setActive(entity.getIsActive());
        dto.setRole(entity.getRole());
        return dto;
    }

    public static User toUserEntity(UserDto dto) {
        if (dto == null) return null;
        User entity = new User();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setEmail(dto.getEmail());
        entity.setPassword(dto.getPassword());
        entity.setAddress(dto.getAddress());
        entity.setActive(dto.getIsActive());
        entity.setRole(dto.getRole());
        return entity;
    }

    // --- CrowdStatus Mapping ---
    public static CrowdStatusDto toCrowdStatusDto(CrowdStatus entity) {
        if (entity == null) return null;
        CrowdStatusDto dto = new CrowdStatusDto();
        dto.setId(entity.getId());
        dto.setLocationName(entity.getLocationName());
        dto.setLocationType(entity.getLocationType());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        if (entity.getCrowdLevel() != null) {
            dto.setCrowdLevel(CrowdStatusDto.CrowdLevel.valueOf(entity.getCrowdLevel().name()));
        }
        dto.setLastUpdated(entity.getUpdatedAt());
        dto.setCurrentVisitorCount(entity.getCurrentVisitorCount());
        dto.setManualOverride(entity.getManualOverride());
        return dto;
    }

    public static CrowdStatus toCrowdStatusEntity(CrowdStatusDto dto) {
        if (dto == null) return null;
        CrowdStatus entity = new CrowdStatus();
        entity.setId(dto.getId());
        entity.setLocationName(dto.getLocationName());
        entity.setLocationType(dto.getLocationType());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        if (dto.getCrowdLevel() != null) {
            entity.setCrowdLevel(CrowdStatus.CrowdLevel.valueOf(dto.getCrowdLevel().name()));
        }
        entity.setCurrentVisitorCount(dto.getCurrentVisitorCount());
        entity.setManualOverride(dto.getManualOverride());
        return entity;
    }

    // --- EmergencyAlert Mapping ---
    public static EmergencyAlertDto toEmergencyAlertDto(EmergencyAlert entity) {
        if (entity == null) return null;
        EmergencyAlertDto dto = new EmergencyAlertDto();
        dto.setId(entity.getId());
        dto.setAlertId(entity.getAlertId());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setEmergencyType(entity.getEmergencyType());
        dto.setStatus(entity.getStatus());
        dto.setPriority(entity.getPriority());
        dto.setReportedTime(entity.getCreatedAt());
        dto.setAcceptedBy(entity.getAcceptedBy());
        dto.setResolvedBy(entity.getResolvedBy());
        dto.setResolvedTime(entity.getResolvedTime());
        return dto;
    }

    public static EmergencyAlert toEmergencyAlertEntity(EmergencyAlertDto dto) {
        if (dto == null) return null;
        EmergencyAlert entity = new EmergencyAlert();
        entity.setId(dto.getId());
        entity.setAlertId(dto.getAlertId());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setEmergencyType(dto.getEmergencyType());
        entity.setStatus(dto.getStatus());
        entity.setPriority(dto.getPriority());
        entity.setAcceptedBy(dto.getAcceptedBy());
        entity.setResolvedBy(dto.getResolvedBy());
        entity.setResolvedTime(dto.getResolvedTime());
        return entity;
    }

    // --- UserActivity Mapping ---
    public static UserActivityDto toUserActivityDto(UserActivity entity) {
        if (entity == null) return null;
        UserActivityDto dto = new UserActivityDto();
        dto.setId(entity.getId());
        dto.setIpAddress(entity.getIpAddress());
        dto.setPageVisited(entity.getPageVisited());
        dto.setDuration(entity.getDuration());
        dto.setTimestamp(entity.getCreatedAt());
        return dto;
    }

    public static UserActivity toUserActivityEntity(UserActivityDto dto) {
        if (dto == null) return null;
        UserActivity entity = new UserActivity();
        entity.setId(dto.getId());
        entity.setIpAddress(dto.getIpAddress());
        entity.setPageVisited(dto.getPageVisited());
        entity.setDuration(dto.getDuration());
        return entity;
    }

    // --- Helpline Mapping ---
    public static HelplineDto toHelplineDto(Helpline entity) {
        if (entity == null) return null;
        HelplineDto dto = new HelplineDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setNumber(entity.getNumber());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public static Helpline toHelplineEntity(HelplineDto dto) {
        if (dto == null) return null;
        Helpline entity = new Helpline();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setNumber(dto.getNumber());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        return entity;
    }

    // --- Hospital Mapping ---
    public static HospitalDto toHospitalDto(Hospital entity) {
        if (entity == null) return null;
        HospitalDto dto = new HospitalDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setAddress(entity.getAddress());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setContact(entity.getContact());
        dto.setBeds(entity.getBeds());
        dto.setStatus(entity.getStatus());
        return dto;
    }

    public static Hospital toHospitalEntity(HospitalDto dto) {
        if (dto == null) return null;
        Hospital entity = new Hospital();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setAddress(dto.getAddress());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setContact(dto.getContact());
        entity.setBeds(dto.getBeds());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        return entity;
    }

    // --- PoojaSchedule Mapping ---
    public static PoojaScheduleDTO toPoojaScheduleDto(PoojaSchedule entity) {
        if (entity == null) return null;
        PoojaScheduleDTO dto = new PoojaScheduleDTO();
        dto.setId(entity.getId());
        dto.setDay(entity.getDay());
        dto.setDeity(entity.getDeity());
        dto.setSpecialPooja(entity.getSpecialPooja());
        dto.setIcon(entity.getIcon());
        dto.setTime(entity.getTime());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setPlace(entity.getPlace());
        dto.setDescription(entity.getDescription());
        if (entity.getCreatedAt() != null) dto.setCreatedAt(entity.getCreatedAt().toString());
        if (entity.getUpdatedAt() != null) dto.setUpdatedAt(entity.getUpdatedAt().toString());
        return dto;
    }

    public static PoojaSchedule toPoojaScheduleEntity(PoojaScheduleDTO dto) {
        if (dto == null) return null;
        PoojaSchedule entity = new PoojaSchedule();
        entity.setId(dto.getId());
        entity.setDay(dto.getDay());
        entity.setDeity(dto.getDeity());
        entity.setSpecialPooja(dto.getSpecialPooja());
        entity.setIcon(dto.getIcon());
        entity.setTime(dto.getTime());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setPlace(dto.getPlace());
        entity.setDescription(dto.getDescription());
        return entity;
    }

    // --- PoojaBooking Mapping ---
    public static PoojaBookingDTO toPoojaBookingDto(PoojaBooking entity) {
        if (entity == null) return null;
        PoojaBookingDTO dto = new PoojaBookingDTO();
        dto.setId(entity.getId());
        dto.setAcharyaId(entity.getAcharyaId());
        dto.setPoojaId(entity.getPoojaId());
        dto.setAcharyaName(entity.getAcharyaName());
        dto.setPoojaName(entity.getPoojaName());
        dto.setPoojaDuration(entity.getPoojaDuration());
        dto.setPrice(entity.getPrice());
        dto.setDevoteeName(entity.getDevoteeName());
        dto.setGotra(entity.getGotra());
        dto.setSankalpa(entity.getSankalpa());
        dto.setFamilyCount(entity.getFamilyCount());
        dto.setLocation(entity.getLocation());
        dto.setPreferredDate(entity.getPreferredDate());
        dto.setPreferredSlot(entity.getPreferredSlot());
        dto.setStatus(entity.getStatus());
        if (entity.getCreatedAt() != null) dto.setCreatedAt(entity.getCreatedAt().toString());
        if (entity.getUpdatedAt() != null) dto.setUpdatedAt(entity.getUpdatedAt().toString());
        return dto;
    }

    public static PoojaBooking toPoojaBookingEntity(PoojaBookingDTO dto) {
        if (dto == null) return null;
        PoojaBooking entity = new PoojaBooking();
        entity.setId(dto.getId());
        entity.setAcharyaId(dto.getAcharyaId());
        entity.setPoojaId(dto.getPoojaId());
        entity.setAcharyaName(dto.getAcharyaName());
        entity.setPoojaName(dto.getPoojaName());
        entity.setPoojaDuration(dto.getPoojaDuration());
        entity.setPrice(dto.getPrice());
        entity.setDevoteeName(dto.getDevoteeName());
        entity.setGotra(dto.getGotra());
        entity.setSankalpa(dto.getSankalpa());
        entity.setFamilyCount(dto.getFamilyCount());
        entity.setLocation(dto.getLocation());
        entity.setPreferredDate(dto.getPreferredDate());
        entity.setPreferredSlot(dto.getPreferredSlot());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
        return entity;
    }

    // --- LiveUpdate Mapping ---
    public static LiveUpdateDto toLiveUpdateDto(LiveUpdate entity) {
        if (entity == null) return null;
        LiveUpdateDto dto = new LiveUpdateDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setLocation(entity.getLocation());
        dto.setImagePath(entity.getImagePath());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setFeatured(entity.isFeatured());
        dto.setCategory(entity.getCategory());
        dto.setExternalLink(entity.getExternalLink());
        return dto;
    }

    public static LiveUpdate toLiveUpdateEntity(LiveUpdateDto dto) {
        if (dto == null) return null;
        LiveUpdate entity = new LiveUpdate();
        entity.setId(dto.getId());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setLocation(dto.getLocation());
        entity.setImagePath(dto.getImagePath());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setFeatured(dto.isFeatured());
        entity.setCategory(dto.getCategory());
        entity.setExternalLink(dto.getExternalLink());
        return entity;
    }

    // --- DonationConfig Mapping ---
    public static DonationConfigDto toDonationConfigDto(DonationConfig entity) {
        if (entity == null) return null;
        DonationConfigDto dto = new DonationConfigDto();
        dto.setId(entity.getId());
        dto.setHeroTitle(entity.getHeroTitle());
        dto.setHeroSubtitle(entity.getHeroSubtitle());
        dto.setPlannerTitle(entity.getPlannerTitle());
        dto.setPlannerDescription(entity.getPlannerDescription());
        dto.setDonationSectionTitle(entity.getDonationSectionTitle());
        dto.setPresetAmounts(entity.getPresetAmounts());
        dto.setGiftEligibilityAmount(entity.getGiftEligibilityAmount());
        dto.setGiftTitle(entity.getGiftTitle());
        dto.setGiftDescription(entity.getGiftDescription());
        dto.setUpiId(entity.getUpiId());
        dto.setUpiName(entity.getUpiName());
        dto.setPaymentMethods(entity.getPaymentMethods());
        return dto;
    }

    public static DonationConfig toDonationConfigEntity(DonationConfigDto dto) {
        if (dto == null) return null;
        DonationConfig entity = new DonationConfig();
        entity.setId(dto.getId());
        entity.setHeroTitle(dto.getHeroTitle());
        entity.setHeroSubtitle(dto.getHeroSubtitle());
        entity.setPlannerTitle(dto.getPlannerTitle());
        entity.setPlannerDescription(dto.getPlannerDescription());
        entity.setDonationSectionTitle(dto.getDonationSectionTitle());
        entity.setPresetAmounts(dto.getPresetAmounts());
        entity.setGiftEligibilityAmount(dto.getGiftEligibilityAmount());
        entity.setGiftTitle(dto.getGiftTitle());
        entity.setGiftDescription(dto.getGiftDescription());
        entity.setUpiId(dto.getUpiId());
        entity.setUpiName(dto.getUpiName());
        entity.setPaymentMethods(dto.getPaymentMethods());
        return entity;
    }

    // --- DonationTransaction Mapping ---
    public static DonationTransactionDto toDonationTransactionDto(DonationTransaction entity) {
        if (entity == null) return null;
        DonationTransactionDto dto = new DonationTransactionDto();
        dto.setId(entity.getId());
        dto.setDonorName(entity.getDonorName());
        dto.setDonorEmail(entity.getDonorEmail());
        dto.setDonorPhone(entity.getDonorPhone());
        dto.setDonorUPI(entity.getDonorUPI());
        dto.setAmount(entity.getAmount());
        dto.setTransactionReference(entity.getTransactionReference());
        dto.setStatus(entity.getStatus());
        dto.setMessage(entity.getMessage());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public static DonationTransaction toDonationTransactionEntity(DonationTransactionDto dto) {
        if (dto == null) return null;
        DonationTransaction entity = new DonationTransaction();
        entity.setId(dto.getId());
        entity.setDonorName(dto.getDonorName());
        entity.setDonorEmail(dto.getDonorEmail());
        entity.setDonorPhone(dto.getDonorPhone());
        entity.setDonorUPI(dto.getDonorUPI());
        entity.setAmount(dto.getAmount());
        entity.setTransactionReference(dto.getTransactionReference());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
        entity.setMessage(dto.getMessage());
        return entity;
    }

    // --- UserAddress Mapping ---
    public static UserAddressDto toUserAddressDto(UserAddress entity) {
        if (entity == null) return null;
        UserAddressDto dto = new UserAddressDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setPhone(entity.getPhone());
        dto.setPincode(entity.getPincode());
        dto.setHouseNo(entity.getHouseNo());
        dto.setArea(entity.getArea());
        dto.setLandmark(entity.getLandmark());
        dto.setCity(entity.getCity());
        dto.setState(entity.getState());
        dto.setStateCode(entity.getStateCode());
        dto.setAddressType(entity.getAddressType());
        dto.setIsDefault(entity.getIsDefault());
        dto.setCityVillage(entity.getCityVillage());
        return dto;
    }

    public static UserAddress toUserAddressEntity(UserAddressDto dto) {
        if (dto == null) return null;
        UserAddress entity = new UserAddress();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setPhone(dto.getPhone());
        entity.setPincode(dto.getPincode());
        entity.setHouseNo(dto.getHouseNo());
        entity.setArea(dto.getArea());
        entity.setLandmark(dto.getLandmark());
        entity.setCity(dto.getCity());
        entity.setState(dto.getState());
        entity.setStateCode(dto.getStateCode());
        entity.setCityVillage(dto.getCityVillage() != null ? dto.getCityVillage() : (dto.getCity() != null ? dto.getCity() : ""));
        entity.setAddressType(dto.getAddressType() != null ? dto.getAddressType() : "Home");
        entity.setIsDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false);
        return entity;
    }

    // --- SafetyResource Mapping ---
    public static SafetyResourceDto toSafetyResourceDto(SafetyResource entity) {
        if (entity == null) return null;
        SafetyResourceDto dto = new SafetyResourceDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setType(entity.getType());
        dto.setAddress(entity.getAddress());
        dto.setContact(entity.getContact());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public static SafetyResource toSafetyResourceEntity(SafetyResourceDto dto) {
        if (dto == null) return null;
        SafetyResource entity = new SafetyResource();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setType(dto.getType());
        entity.setAddress(dto.getAddress());
        entity.setContact(dto.getContact());
        if (dto.getLatitude() != null) entity.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) entity.setLongitude(dto.getLongitude());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        return entity;
    }
}
