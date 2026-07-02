package com.kumbh.controller;

import com.kumbh.dto.SafetyResourceDto;
import com.kumbh.entity.SafetyResource;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.service.SafetyResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/safety-resources")
public class SafetyResourceController {

    @Autowired
    private SafetyResourceService service;

    @GetMapping
    public ResponseEntity<Page<SafetyResourceDto>> getAllResources(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return ResponseEntity.ok(service.getAllResources(search, page, size, sortBy, direction));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SafetyResourceDto> getResourceById(@PathVariable Long id) {
        return service.getResourceById(id)
                .map(r -> ResponseEntity.ok(EntityDtoMapper.toSafetyResourceDto(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SafetyResourceDto> createResource(@Valid @RequestBody SafetyResourceDto resourceDto) {
        SafetyResource resource = EntityDtoMapper.toSafetyResourceEntity(resourceDto);
        return new ResponseEntity<>(EntityDtoMapper.toSafetyResourceDto(service.createResource(resource)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SafetyResourceDto> updateResource(@PathVariable Long id, @Valid @RequestBody SafetyResourceDto resourceDto) {
        SafetyResource resourceDetails = EntityDtoMapper.toSafetyResourceEntity(resourceDto);
        return service.updateResource(id, resourceDetails)
                .map(r -> ResponseEntity.ok(EntityDtoMapper.toSafetyResourceDto(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        if (service.deleteResource(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
