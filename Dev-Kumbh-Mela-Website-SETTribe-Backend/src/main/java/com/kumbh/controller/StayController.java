package com.kumbh.controller;

import com.kumbh.dto.StayDto;
import com.kumbh.entity.Stay;
import com.kumbh.service.StayService;
import com.kumbh.util.Mapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import jakarta.validation.ConstraintViolationException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Set;

@RestController
@RequestMapping("/api/stays")
public class StayController {

    @Autowired
    private StayService service;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private Validator validator;

    private final String uploadDir = "uploads/travel-stay/";

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createStay(
            @RequestParam("stay") String stayJson,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            if (stayJson == null) {
                return ResponseEntity.badRequest().body("Missing 'stay' parameter");
            }

            StayDto stayDto = objectMapper.readValue(stayJson, StayDto.class);
            
            // Validate DTO
            Set<ConstraintViolation<StayDto>> violations = validator.validate(stayDto);
            if (!violations.isEmpty()) {
                throw new ConstraintViolationException(violations);
            }

            Stay stay = Mapper.toEntity(stayDto);
            
            if (image != null && !image.isEmpty()) {
                validateImage(image);
                String fileName = saveImage(image);
                stay.setImagePath("/api/stays/images/" + fileName);
            }
            
            return new ResponseEntity<>(Mapper.toDto(service.createStay(stay)), HttpStatus.CREATED);
        } catch (ConstraintViolationException e) {
            java.util.Map<String, String> errors = new java.util.HashMap<>();
            e.getConstraintViolations().forEach(violation -> {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            });
            return ResponseEntity.badRequest().body(errors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateStay(
            @PathVariable Long id,
            @RequestParam("stay") String stayJson,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            if (stayJson == null) {
                return ResponseEntity.badRequest().body("Missing 'stay' parameter");
            }

            StayDto stayDto = objectMapper.readValue(stayJson, StayDto.class);

            // Validate DTO
            Set<ConstraintViolation<StayDto>> violations = validator.validate(stayDto);
            if (!violations.isEmpty()) {
                throw new ConstraintViolationException(violations);
            }

            Stay stayDetails = Mapper.toEntity(stayDto);
            
            if (image != null && !image.isEmpty()) {
                validateImage(image);
                String fileName = saveImage(image);
                stayDetails.setImagePath("/api/stays/images/" + fileName);
            }
            
            return ResponseEntity.ok(Mapper.toDto(service.updateStay(id, stayDetails)));
        } catch (ConstraintViolationException e) {
            java.util.Map<String, String> errors = new java.util.HashMap<>();
            e.getConstraintViolations().forEach(violation -> {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            });
            return ResponseEntity.badRequest().body(errors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }

    private void validateImage(MultipartFile image) {
        // File size limit: 2MB
        if (image.getSize() > 2 * 1024 * 1024) {
            throw new RuntimeException("Image size must be less than 2MB");
        }

        String fileName = image.getOriginalFilename();
        if (fileName != null) {
            String lowercaseName = fileName.toLowerCase();
            if (lowercaseName.endsWith(".exe") || lowercaseName.endsWith(".js") || lowercaseName.split("\\.").length > 2) {
                throw new RuntimeException("Invalid file type or format");
            }
        }

        // File type validation
        String contentType = image.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/webp"))) {
            throw new RuntimeException("Only JPG, PNG, and WEBP images are allowed");
        }
    }

    @GetMapping
    public ResponseEntity<Page<StayDto>> getAllStays(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return ResponseEntity.ok(service.getPaginatedStays(search, page, size, sortBy, direction));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StayDto> getStayById(@PathVariable Long id) {
        return ResponseEntity.ok(Mapper.toDto(service.getStayById(id)));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<StayDto>> getStaysByCategory(@PathVariable String category) {
        List<StayDto> dtos = service.getStaysByCategory(category).stream()
                .map(Mapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStay(@PathVariable Long id) {
        service.deleteStay(id);
        return ResponseEntity.noContent().build();
    }

    private String saveImage(MultipartFile image) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return fileName;
    }

    @GetMapping("/images/{fileName}")
    public ResponseEntity<byte[]> getImage(@PathVariable String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(fileName);
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }
        byte[] imageBytes = Files.readAllBytes(filePath);
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = "image/jpeg"; // Default fallback
        }
        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .body(imageBytes);
    }
}
