package com.kumbh.controller;

import com.kumbh.dto.PoojaBookingDTO;
import com.kumbh.service.PoojaBookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pooja-bookings")
public class PoojaBookingController {

    @Autowired
    private PoojaBookingService service;

    @PostMapping
    public ResponseEntity<PoojaBookingDTO> createBooking(@Valid @RequestBody PoojaBookingDTO dto) {
        return new ResponseEntity<>(service.createBooking(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<PoojaBookingDTO>> getAllBookings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return ResponseEntity.ok(service.getAllBookings(search, page, size, sortBy, direction));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PoojaBookingDTO> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.updateStatus(id, body.getOrDefault("status", "PENDING")));
    }

    @GetMapping("/booked-slots")
    public ResponseEntity<List<String>> getBookedSlots(
            @RequestParam Long acharyaId,
            @RequestParam String date) {
        return ResponseEntity.ok(service.getBookedSlots(acharyaId, date));
    }
}
