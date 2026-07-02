package com.kumbh.controller;

import com.kumbh.dto.AcharyaDTO;
import com.kumbh.dto.PoojaItemDTO;
import com.kumbh.service.AcharyaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Validator;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/acharyas")
public class AcharyaController {

    private static final Logger logger = LoggerFactory.getLogger(AcharyaController.class);

    @Autowired
    private AcharyaService service;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private Validator validator;

    private final String uploadDir = "uploads/";

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<AcharyaDTO> createAcharya(
            @RequestParam("acharya") String acharyaJson,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        logger.info("Received request to create Acharya");
        try {
            AcharyaDTO dto = objectMapper.readValue(acharyaJson, AcharyaDTO.class);
            validateDto(dto);
            
            if (image != null && !image.isEmpty()) {
                String fileName = saveImage(image);
                dto.setImagePath("/api/acharyas/images/" + fileName);
            }
            
            return new ResponseEntity<>(service.createAcharya(dto), HttpStatus.CREATED);
        } catch (IOException e) {
            logger.error("Failed to parse Acharya JSON or save image", e);
            throw new RuntimeException("Failed to process request: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<Page<AcharyaDTO>> getAllAcharyas(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return ResponseEntity.ok(service.getAllAcharyas(search, page, size, sortBy, direction));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<AcharyaDTO> updateAcharya(
            @PathVariable Long id,
            @RequestParam("acharya") String acharyaJson,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        logger.info("Received request to update Acharya with id: {}", id);
        try {
            AcharyaDTO dto = objectMapper.readValue(acharyaJson, AcharyaDTO.class);
            validateDto(dto);
            
            if (image != null && !image.isEmpty()) {
                String fileName = saveImage(image);
                dto.setImagePath("/api/acharyas/images/" + fileName);
            }
            
            return ResponseEntity.ok(service.updateAcharya(id, dto));
        } catch (IOException e) {
            logger.error("Failed to update Acharya with id: {}", id, e);
            throw new RuntimeException("Failed to update Acharya: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAcharya(@PathVariable Long id) {
        logger.info("Deleting Acharya with id: {}", id);
        service.deleteAcharya(id);
        return ResponseEntity.noContent().build();
    }

    private void validateDto(AcharyaDTO dto) {
        Set<ConstraintViolation<AcharyaDTO>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        
        if (dto.getPoojas() != null) {
            for (PoojaItemDTO pDto : dto.getPoojas()) {
                Set<ConstraintViolation<PoojaItemDTO>> pViolations = validator.validate(pDto);
                if (!pViolations.isEmpty()) {
                    throw new ConstraintViolationException(pViolations);
                }
            }
        }
    }

    private String saveImage(MultipartFile image) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        logger.info("Saved image to: {}", filePath);
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
        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .body(imageBytes);
    }
}
