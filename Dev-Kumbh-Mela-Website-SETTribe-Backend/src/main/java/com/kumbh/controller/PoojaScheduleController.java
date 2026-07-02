package com.kumbh.controller;

import com.kumbh.dto.PoojaScheduleDTO;
import com.kumbh.service.PoojaScheduleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pooja-schedules")
public class PoojaScheduleController {

    @Autowired
    private PoojaScheduleService service;

    @GetMapping
    public ResponseEntity<Page<PoojaScheduleDTO>> getAllSchedules(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return ResponseEntity.ok(service.getAllSchedules(search, page, size, sortBy, direction));
    }

    @PostMapping
    public ResponseEntity<PoojaScheduleDTO> createSchedule(@Valid @RequestBody PoojaScheduleDTO dto) {
        return ResponseEntity.ok(service.createSchedule(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PoojaScheduleDTO> updateSchedule(@PathVariable Long id, @Valid @RequestBody PoojaScheduleDTO dto) {
        return ResponseEntity.ok(service.updateSchedule(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        service.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
