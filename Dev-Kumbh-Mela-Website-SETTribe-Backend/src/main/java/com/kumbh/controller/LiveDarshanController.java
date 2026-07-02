package com.kumbh.controller;

import com.kumbh.dto.LiveDarshanDto;
import com.kumbh.service.LiveDarshanService;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/live-darshans")
public class LiveDarshanController {

    @Autowired
    private LiveDarshanService service;

    @Autowired
    private ObjectMapper objectMapper;

    private final String uploadDir = "uploads/";

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<LiveDarshanDto> createDarshan(
            @RequestParam("darshan") String darshanJson,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        
        LiveDarshanDto darshanDto = objectMapper.readValue(darshanJson, LiveDarshanDto.class);
        
        if (image != null && !image.isEmpty()) {
            String fileName = saveImage(image);
            darshanDto.setImagePath("/api/live-darshans/images/" + fileName);
        }
        
        return new ResponseEntity<>(service.createDarshan(darshanDto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<LiveDarshanDto>> getAllDarshans(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return ResponseEntity.ok(service.getAllDarshans(search, page, size, sortBy, direction));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LiveDarshanDto> getDarshanById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getDarshanById(id));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<LiveDarshanDto> updateDarshan(
            @PathVariable Long id,
            @RequestParam("darshan") String darshanJson,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        
        LiveDarshanDto darshanDto = objectMapper.readValue(darshanJson, LiveDarshanDto.class);
        
        if (image != null && !image.isEmpty()) {
            String fileName = saveImage(image);
            darshanDto.setImagePath("/api/live-darshans/images/" + fileName);
        }
        
        return ResponseEntity.ok(service.updateDarshan(id, darshanDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDarshan(@PathVariable Long id) {
        service.deleteDarshan(id);
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
        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .body(imageBytes);
    }
}
