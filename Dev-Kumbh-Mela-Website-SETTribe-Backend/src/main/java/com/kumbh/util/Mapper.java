package com.kumbh.util;

import com.kumbh.dto.*;
import com.kumbh.entity.*;
import java.util.List;
import java.util.stream.Collectors;

public class Mapper {

    // --- Stay Mapping ---
    public static StayDto toDto(Stay entity) {
        if (entity == null) return null;
        StayDto dto = new StayDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setCategory(entity.getCategory() != null ? entity.getCategory().getDisplayName() : null);
        dto.setRating(entity.getRating() != null ? String.valueOf(entity.getRating()) : null);
        dto.setImagePath(entity.getImagePath());
        dto.setPrice(entity.getPrice() != null ? String.valueOf(entity.getPrice()) : null);
        dto.setFeatures(entity.getFeatures());
        dto.setNavigationLink(entity.getNavigationLink());
        dto.setRemoveImage(entity.isRemoveImage());
        return dto;
    }

    public static Stay toEntity(StayDto dto) {
        if (dto == null) return null;
        Stay entity = new Stay();
        entity.setId(dto.getId());
        
        // Normalize Title: "gateway hotel nashik" -> "Gateway Hotel Nashik"
        entity.setTitle(normalizeTitle(dto.getTitle()));
        
        // Map Category String to Enum
        if (dto.getCategory() != null) {
            entity.setCategory(StayCategory.fromDisplayName(dto.getCategory()));
        }

        // Convert Rating String to Double and Round to nearest 0.5
        if (dto.getRating() != null) {
            try {
                double r = Double.parseDouble(dto.getRating());
                entity.setRating(Math.round(r * 2.0) / 2.0);
            } catch (NumberFormatException e) {
                entity.setRating(0.0);
            }
        }

        entity.setImagePath(dto.getImagePath());
        
        // Convert Price String to Long
        if (dto.getPrice() != null) {
            try {
                entity.setPrice(Long.parseLong(dto.getPrice()));
            } catch (NumberFormatException e) {
                entity.setPrice(0L);
            }
        }

        // Clean Features: max 15, length 2-50, remove duplicates, trim
        if (dto.getFeatures() != null) {
            List<String> cleanedFeatures = dto.getFeatures().stream()
                .map(String::trim)
                .filter(f -> f.length() >= 2 && f.length() <= 50)
                .map(String::toLowerCase)
                .distinct()
                .limit(15)
                .map(f -> f.substring(0, 1).toUpperCase() + f.substring(1)) // Capitalize first letter
                .collect(Collectors.toList());
            entity.setFeatures(cleanedFeatures);
        }

        entity.setNavigationLink(dto.getNavigationLink());
        entity.setRemoveImage(dto.isRemoveImage());
        
        return entity;
    }

    // --- HealthTip Mapping ---
    public static HealthTipDto toDto(HealthTip entity) {
        if (entity == null) return null;
        HealthTipDto dto = new HealthTipDto();
        dto.setId(entity.getId());
        dto.setCategory(entity.getCategory());
        dto.setTipText(entity.getTipText());
        dto.setImagePath(entity.getImagePath());
        return dto;
    }

    public static HealthTip toEntity(HealthTipDto dto) {
        if (dto == null) return null;
        HealthTip entity = new HealthTip();
        entity.setId(dto.getId());
        entity.setCategory(dto.getCategory());
        entity.setTipText(dto.getTipText());
        entity.setImagePath(dto.getImagePath());
        return entity;
    }

    // --- Hospital Mapping ---
    public static HospitalDto toDto(Hospital entity) {
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

    public static Hospital toEntity(HospitalDto dto) {
        if (dto == null) return null;
        Hospital entity = new Hospital();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setAddress(dto.getAddress());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setContact(dto.getContact());
        entity.setBeds(dto.getBeds());
        entity.setStatus(dto.getStatus());
        return entity;
    }

    // --- Acharya Mapping ---
    public static AcharyaDTO toDto(Acharya entity, List<PoojaItem> poojas) {
        if (entity == null) return null;
        AcharyaDTO dto = new AcharyaDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setSpecialty(entity.getSpecialty());
        dto.setExperience(entity.getExperience());
        dto.setRating(entity.getRating());
        dto.setReviews(entity.getReviews());
        dto.setImagePath(entity.getImagePath());
        dto.setLocation(entity.getLocation());
        
        if (poojas != null) {
            dto.setPoojas(poojas.stream().map(Mapper::toDto).collect(Collectors.toList()));
        }
        
        if (entity.getCreatedAt() != null) dto.setCreatedAt(entity.getCreatedAt().toString());
        if (entity.getUpdatedAt() != null) dto.setUpdatedAt(entity.getUpdatedAt().toString());
        
        return dto;
    }

    public static Acharya toEntity(AcharyaDTO dto) {
        if (dto == null) return null;
        Acharya entity = new Acharya();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setSpecialty(dto.getSpecialty());
        entity.setExperience(dto.getExperience());
        entity.setRating(dto.getRating() != null ? dto.getRating() : 5.0);
        entity.setReviews(dto.getReviews() != null ? dto.getReviews() : 0);
        entity.setImagePath(dto.getImagePath());
        entity.setLocation(dto.getLocation());
        return entity;
    }

    // --- Pooja Mapping ---
    public static PoojaItemDTO toDto(PoojaItem entity) {
        if (entity == null) return null;
        PoojaItemDTO dto = new PoojaItemDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setPrice(entity.getPrice());
        dto.setDuration(entity.getDuration());
        return dto;
    }

    public static PoojaItem toEntity(PoojaItemDTO dto) {
        if (dto == null) return null;
        PoojaItem entity = new PoojaItem();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setPrice(dto.getPrice());
        entity.setDuration(dto.getDuration());
        return entity;
    }

    private static String normalizeTitle(String title) {
        if (title == null || title.isEmpty()) return title;
        String[] words = title.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (word.length() > 0) {
                sb.append(Character.toUpperCase(word.charAt(0)))
                  .append(word.substring(1).toLowerCase())
                  .append(" ");
            }
        }
        return sb.toString().trim();
    }
}
