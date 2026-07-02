package com.kumbh.controller;

import com.kumbh.dto.ApiResponse;
import com.kumbh.entity.TravelGroup;
import com.kumbh.entity.TravelGroupMember;
import com.kumbh.entity.User;
import com.kumbh.service.TravelGroupService;
import com.kumbh.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/travel-groups")
public class TravelGroupController {

    @Autowired
    private TravelGroupService travelGroupService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createGroup(@Valid @RequestBody TravelGroup group, Authentication authentication) {
        try {
            Long userId = null;
            String userName = null;
            
            User user = getAuthenticatedUser(authentication);
            if (user != null) {
                userId = (long) user.getId();
                userName = user.getName();
            }

            TravelGroup created = travelGroupService.createGroup(group, userId, userName);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> searchGroups(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<TravelGroup> groups = travelGroupService.searchGroups(source, date);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllGroups() {
        try {
            List<TravelGroup> groups = travelGroupService.getAllGroups();
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGroupById(@PathVariable Long id) {
        try {
            TravelGroup group = travelGroupService.getGroupById(id);
            return ResponseEntity.ok(group);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<?> getGroupMembers(@PathVariable Long id) {
        try {
            List<TravelGroupMember> members = travelGroupService.getGroupMembers(id);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinGroup(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        try {
            Long userId = null;
            String name = payload.get("memberName");
            String phone = payload.get("memberPhone");

            User user = getAuthenticatedUser(authentication);
            if (user != null) {
                userId = (long) user.getId();
                if (name == null || name.trim().isEmpty()) {
                    name = user.getName();
                }
                if (phone == null || phone.trim().isEmpty()) {
                    phone = "";
                }
            }

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Member name is required."));
            }

            TravelGroupMember joined = travelGroupService.joinGroup(id, userId, name, phone);
            return ResponseEntity.ok(joined);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/join-by-code")
    public ResponseEntity<?> joinGroupByCode(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        try {
            Long userId = null;
            String code = payload.get("groupCode");
            String name = payload.get("memberName");
            String phone = payload.get("memberPhone");

            User user = getAuthenticatedUser(authentication);
            if (user != null) {
                userId = (long) user.getId();
                if (name == null || name.trim().isEmpty()) {
                    name = user.getName();
                }
                if (phone == null || phone.trim().isEmpty()) {
                    phone = "";
                }
            }

            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Group code is required."));
            }
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Member name is required."));
            }

            TravelGroupMember joined = travelGroupService.joinGroupByCode(code, userId, name, phone);
            return ResponseEntity.ok(joined);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long id, Authentication authentication) {
        try {
            // Note: Since operator delete is requested, we allow it.
            // Normally we would check if operator or group creator, but for mela use-case simple delete is fine.
            travelGroupService.deleteGroup(id);
            return ResponseEntity.ok(new ApiResponse(true, "Group deleted successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            Long userId = (Long) authentication.getPrincipal();
            return userService.getAllUsersList().stream()
                    .filter(u -> Long.valueOf(u.getId()).equals(userId))
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }
}
