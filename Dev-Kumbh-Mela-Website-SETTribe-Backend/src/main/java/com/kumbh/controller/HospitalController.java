package com.kumbh.controller;

import com.kumbh.dto.HospitalDto;
import com.kumbh.entity.Hospital;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.service.HospitalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    @Autowired
    private HospitalService service;

    @GetMapping("/check-name")
    public ResponseEntity<Map<String, Object>> checkName(@RequestParam String name) {
        boolean exists = service.existsByName(name);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        response.put("message", exists ? "Hospital name already exist" : "Hospital name available");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-contact")
    public ResponseEntity<Map<String, Object>> checkContact(@RequestParam String contact) {
        boolean exists = service.existsByContact(contact);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        response.put("message", exists ? "Contact number already exist" : "Contact number available");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-latitude")
    public ResponseEntity<Map<String, Object>> checkLatitude(@RequestParam Double latitude) {
        boolean exists = service.existsByLatitude(latitude);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        response.put("message", exists ? "Latitude already exist" : "Latitude available");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-longitude")
    public ResponseEntity<Map<String, Object>> checkLongitude(@RequestParam Double longitude) {
        boolean exists = service.existsByLongitude(longitude);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        response.put("message", exists ? "Longitude already exist" : "Longitude available");
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<HospitalDto>> getAllHospitals(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return ResponseEntity.ok(service.getAllHospitals(search, page, size, sortBy, direction));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospitalDto> getHospitalById(@PathVariable Long id) {
        return service.getHospitalById(id)
                .map(h -> ResponseEntity.ok(EntityDtoMapper.toHospitalDto(h)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<HospitalDto> createHospital(@Valid @RequestBody HospitalDto hospitalDto) {
        Hospital hospital = EntityDtoMapper.toHospitalEntity(hospitalDto);
        return new ResponseEntity<>(EntityDtoMapper.toHospitalDto(service.createHospital(hospital)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HospitalDto> updateHospital(@PathVariable Long id, @Valid @RequestBody HospitalDto hospitalDto) {
        Hospital hospitalDetails = EntityDtoMapper.toHospitalEntity(hospitalDto);
        return service.updateHospital(id, hospitalDetails)
                .map(h -> ResponseEntity.ok(EntityDtoMapper.toHospitalDto(h)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHospital(@PathVariable Long id) {
        if (service.deleteHospital(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
