package com.kumbh.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kumbh.dto.HealthTipDto;
import com.kumbh.entity.HealthTip;
import com.kumbh.service.HealthTipService;
import com.kumbh.util.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/health-tips")
public class HealthTipController {

    @Autowired
    private HealthTipService service;

    @Autowired
    private ObjectMapper objectMapper;

    private final String uploadDir = "uploads/health_tips/";

    @GetMapping
    public ResponseEntity<List<HealthTipDto>> getAllTips() {
        List<HealthTipDto> dtos = service.getAllTips().stream()
                .map(Mapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<HealthTipDto>> getTipsByCategory(@PathVariable String category) {
        List<HealthTipDto> dtos = service.getTipsByCategory(category).stream()
                .map(Mapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HealthTipDto> createTip(
            @RequestParam("tip") String tipJson,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        
        HealthTipDto tipDto = objectMapper.readValue(tipJson, HealthTipDto.class);
        HealthTip tip = Mapper.toEntity(tipDto);

        // If this is an existing category and no image provided, inherit the image path from other tips in same category
        if ((image == null || image.isEmpty()) && (tip.getImagePath() == null || tip.getImagePath().isEmpty())) {
            service.getTipByCategory(tip.getCategory()).ifPresent(existing -> {
                tip.setImagePath(existing.getImagePath());
            });
        }

        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path path = Paths.get(uploadDir + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, image.getBytes());
            String newImagePath = "/api/health-tips/image/" + fileName;
            tip.setImagePath(newImagePath);
            
            // Update all existing tips in this category to use the new image
            List<HealthTip> sameCategoryTips = service.getTipsByCategory(tip.getCategory());
            for (HealthTip existingTip : sameCategoryTips) {
                existingTip.setImagePath(newImagePath);
                service.updateTip(existingTip.getId(), existingTip);
            }
        }

        return new ResponseEntity<>(Mapper.toDto(service.createTip(tip)), HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HealthTipDto> updateTip(
            @PathVariable Long id,
            @RequestParam("tip") String tipJson,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        
        HealthTipDto tipDto = objectMapper.readValue(tipJson, HealthTipDto.class);
        HealthTip tipDetails = Mapper.toEntity(tipDto);

        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path path = Paths.get(uploadDir + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, image.getBytes());
            String newImagePath = "/api/health-tips/image/" + fileName;
            tipDetails.setImagePath(newImagePath);

            // Update all tips in this category to use the new image
            List<HealthTip> sameCategoryTips = service.getTipsByCategory(tipDetails.getCategory());
            for (HealthTip existingTip : sameCategoryTips) {
                existingTip.setImagePath(newImagePath);
                service.updateTip(existingTip.getId(), existingTip);
            }
        }

        return service.updateTip(id, tipDetails)
                .map(t -> ResponseEntity.ok(Mapper.toDto(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTip(@PathVariable Long id) {
        if (service.deleteTip(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/image/{fileName}")
    public ResponseEntity<byte[]> getHealthTipImage(@PathVariable String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir + fileName);
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }
        byte[] imageBytes = Files.readAllBytes(filePath);
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) contentType = "image/jpeg";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(imageBytes);
    }
}
