package com.kumbh.controller;

import com.kumbh.entity.HomepageConfig;
import com.kumbh.service.HomepageConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class HomepageConfigController {

    @Autowired
    private HomepageConfigService homepageConfigService;

    // Public endpoint to get config
    @GetMapping("/homepage-config")
    public ResponseEntity<HomepageConfig> getConfig() {
        return ResponseEntity.ok(homepageConfigService.getConfig());
    }

    // Admin/Operator endpoint to update config
    @PutMapping("/admin/homepage-config")
    public ResponseEntity<HomepageConfig> updateConfig(@RequestBody HomepageConfig config) {
        if (config.getShahiSnanStartDate() == null || config.getShahiSnanStartDate().trim().isEmpty()) {
            throw new RuntimeException("Start date is required");
        }
        if (config.getShahiSnanEndDate() == null || config.getShahiSnanEndDate().trim().isEmpty()) {
            throw new RuntimeException("End date is required");
        }
        if (!isValidDateText(config.getShahiSnanStartDate())) {
            throw new RuntimeException("Start date format is invalid. Please use a valid format (e.g., '18th March 2027' or '20-03-2027')");
        }
        if (!isValidDateText(config.getShahiSnanEndDate())) {
            throw new RuntimeException("End date format is invalid. Please use a valid format (e.g., '20th March 2027' or '20-03-2027')");
        }

        java.time.LocalDate startDate = parseDateText(config.getShahiSnanStartDate());
        java.time.LocalDate endDate = parseDateText(config.getShahiSnanEndDate());
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new RuntimeException("Start Date must be before or equal to End Date");
        }

        HomepageConfig updatedConfig = homepageConfigService.updateConfig(config);
        return ResponseEntity.ok(updatedConfig);
    }

    private boolean isValidDateText(String dateText) {
        if (dateText == null || dateText.trim().isEmpty()) {
            return false;
        }
        String clean = dateText.trim().toLowerCase();
        
        // Pattern 1: dd-mm-yyyy or dd/mm/yyyy or dd.mm.yyyy
        String p1 = "^\\d{1,2}[-./\\s]\\d{1,2}[-./\\s]\\d{4}$";
        
        // Pattern 2: dd(st/nd/rd/th) Month yyyy (e.g. "18th March 2027" or "18 March 2027")
        String p2 = "^\\d{1,2}(st|nd|rd|th)?\\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\\s+\\d{4}$";
        
        // Pattern 3: Month dd, yyyy (e.g. "March 18, 2027")
        String p3 = "^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\\s+\\d{1,2}(st|nd|rd|th)?,?\\s+\\d{4}$";
        
        return clean.matches(p1) || clean.matches(p2) || clean.matches(p3);
    }

    private java.time.LocalDate parseDateText(String dateText) {
        if (dateText == null || dateText.trim().isEmpty()) {
            return null;
        }
        String clean = dateText.trim().toLowerCase();
        
        // Pattern 1: dd-mm-yyyy or dd/mm/yyyy or dd.mm.yyyy
        if (clean.matches("^\\d{1,2}[-./\\s]\\d{1,2}[-./\\s]\\d{4}$")) {
            String[] parts = clean.split("[-./\\s]");
            int day = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);
            int year = Integer.parseInt(parts[2]);
            return java.time.LocalDate.of(year, month, day);
        }
        
        // Pattern 2: dd(st/nd/rd/th) Month yyyy (e.g. "18th March 2027")
        java.util.regex.Matcher m2 = java.util.regex.Pattern.compile("^(\\d{1,2})(?:st|nd|rd|th)?\\s+([a-z]+)\\s+(\\d{4})$").matcher(clean);
        if (m2.matches()) {
            int day = Integer.parseInt(m2.group(1));
            String monthStr = m2.group(2);
            int year = Integer.parseInt(m2.group(3));
            int month = getMonthIndex(monthStr);
            if (month != -1) {
                return java.time.LocalDate.of(year, month, day);
            }
        }
        
        // Pattern 3: Month dd, yyyy (e.g. "March 18, 2027")
        java.util.regex.Matcher m3 = java.util.regex.Pattern.compile("^([a-z]+)\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})$").matcher(clean);
        if (m3.matches()) {
            String monthStr = m3.group(1);
            int day = Integer.parseInt(m3.group(2));
            int year = Integer.parseInt(m3.group(3));
            int month = getMonthIndex(monthStr);
            if (month != -1) {
                return java.time.LocalDate.of(year, month, day);
            }
        }
        
        return null;
    }

    private int getMonthIndex(String monthStr) {
        String[] months = {"jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"};
        for (int i = 0; i < months.length; i++) {
            if (monthStr.startsWith(months[i])) {
                return i + 1; // LocalDate months are 1-12
            }
        }
        return -1;
    }
}
