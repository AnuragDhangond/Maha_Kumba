package com.kumbh.controller;

import com.kumbh.dto.UserAddressDto;
import com.kumbh.entity.User;
import com.kumbh.entity.UserAddress;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.repository.UserAddressRepository;
import com.kumbh.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/addresses")
@Transactional
public class UserAddressController {

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private UserRepository userRepository;

    private Integer getUserIdFromContext() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null || principal.equals("anonymousUser")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return ((Long) principal).intValue();
    }

    // GET ALL ACTIVE ADDRESSES FOR AUTHENTICATED USER
    @GetMapping
    public ResponseEntity<?> getAddresses() {
        try {
            Integer userId = getUserIdFromContext();
            List<UserAddress> addresses = userAddressRepository.findByUserIdAndIsDeletedFalse(userId);
            List<UserAddressDto> dtos = addresses.stream()
                    .map(EntityDtoMapper::toUserAddressDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // CREATE A NEW ADDRESS
    @PostMapping
    public ResponseEntity<?> createAddress(@Valid @RequestBody UserAddressDto dto) {
        try {
            Integer userId = getUserIdFromContext();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

            UserAddress entity = EntityDtoMapper.toUserAddressEntity(dto);
            entity.setUser(user);
            entity.setIsDeleted(false);

            if (entity.getIsDefault()) {
                userAddressRepository.clearDefaultAddresses(userId);
            }

            UserAddress saved = userAddressRepository.save(entity);
            return ResponseEntity.ok(EntityDtoMapper.toUserAddressDto(saved));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // UPDATE AN EXISTING ADDRESS
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Integer id, @Valid @RequestBody UserAddressDto dto) {
        try {
            Integer userId = getUserIdFromContext();
            UserAddress existing = userAddressRepository.findByIdAndUserIdAndIsDeletedFalse(id, userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

            existing.setName(dto.getName());
            existing.setPhone(dto.getPhone());
            existing.setPincode(dto.getPincode());
            existing.setHouseNo(dto.getHouseNo());
            existing.setArea(dto.getArea());
            existing.setLandmark(dto.getLandmark());
            existing.setCity(dto.getCity());
            existing.setState(dto.getState());
            existing.setStateCode(dto.getStateCode());
            existing.setCityVillage(dto.getCityVillage() != null ? dto.getCityVillage() : (dto.getCity() != null ? dto.getCity() : ""));
            existing.setAddressType(dto.getAddressType() != null ? dto.getAddressType() : "Home");

            if (dto.getIsDefault() != null && dto.getIsDefault() && !existing.getIsDefault()) {
                userAddressRepository.clearDefaultAddresses(userId);
                existing.setIsDefault(true);
            } else if (dto.getIsDefault() != null) {
                existing.setIsDefault(dto.getIsDefault());
            }

            UserAddress updated = userAddressRepository.save(existing);
            return ResponseEntity.ok(EntityDtoMapper.toUserAddressDto(updated));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // SOFT-DELETE AN ADDRESS
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Integer id) {
        try {
            Integer userId = getUserIdFromContext();
            UserAddress existing = userAddressRepository.findByIdAndUserIdAndIsDeletedFalse(id, userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

            existing.setIsDeleted(true);
            userAddressRepository.save(existing);
            return ResponseEntity.ok(Map.of("message", "Address deleted successfully"));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // SET DEFAULT ADDRESS
    @PutMapping("/{id}/default")
    public ResponseEntity<?> setDefaultAddress(@PathVariable Integer id) {
        try {
            Integer userId = getUserIdFromContext();
            UserAddress existing = userAddressRepository.findByIdAndUserIdAndIsDeletedFalse(id, userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

            userAddressRepository.clearDefaultAddresses(userId);
            existing.setIsDefault(true);
            UserAddress updated = userAddressRepository.save(existing);
            return ResponseEntity.ok(EntityDtoMapper.toUserAddressDto(updated));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}
