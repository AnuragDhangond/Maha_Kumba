package com.kumbh.controller;

import com.kumbh.dto.HelplineDto;
import com.kumbh.entity.Helpline;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.service.HelplineService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/helplines")
public class HelplineController {

    @Autowired
    private HelplineService service;

    @PostMapping
    public ResponseEntity<HelplineDto> createHelpline(@Valid @RequestBody HelplineDto helplineDto) {
        Helpline helpline = EntityDtoMapper.toHelplineEntity(helplineDto);
        return new ResponseEntity<>(EntityDtoMapper.toHelplineDto(service.createHelpline(helpline)), HttpStatus.CREATED);
    }

    @GetMapping("/check-name")
    public ResponseEntity<Map<String, Object>> checkName(@RequestParam String name) {
        boolean exists = service.existsByName(name);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        response.put("message", exists ? "Authority name already exist" : "Available");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-number")
    public ResponseEntity<Map<String, Object>> checkNumber(@RequestParam String number) {
        boolean exists = service.existsByNumber(number);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        response.put("message", exists ? "Authority number already exist" : "Available");
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<HelplineDto>> getAllHelplines(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction,
            @RequestParam(defaultValue = "false") boolean includeInactive) {
        
        return ResponseEntity.ok(service.getAllHelplines(search, page, size, sortBy, direction, includeInactive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HelplineDto> getHelplineById(@PathVariable Long id) {
        return ResponseEntity.ok(EntityDtoMapper.toHelplineDto(service.getHelplineById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HelplineDto> updateHelpline(@PathVariable Long id, @Valid @RequestBody HelplineDto helplineDto) {
        Helpline helplineDetails = EntityDtoMapper.toHelplineEntity(helplineDto);
        return ResponseEntity.ok(EntityDtoMapper.toHelplineDto(service.updateHelpline(id, helplineDetails)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHelpline(@PathVariable Long id) {
        service.deleteHelpline(id);
        return ResponseEntity.noContent().build();
    }
}
