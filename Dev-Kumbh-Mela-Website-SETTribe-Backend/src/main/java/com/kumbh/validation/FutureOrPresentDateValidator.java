package com.kumbh.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class FutureOrPresentDateValidator implements ConstraintValidator<FutureOrPresentDate, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true; // Let @NotBlank handle empty fields
        }
        try {
            LocalDate date = LocalDate.parse(value);
            LocalDate today = LocalDate.now();
            return !date.isBefore(today);
        } catch (DateTimeParseException e) {
            // Check other potential formats if frontend sends them, but standard is yyyy-MM-dd
            try {
                LocalDate date = LocalDate.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                LocalDate today = LocalDate.now();
                return !date.isBefore(today);
            } catch (DateTimeParseException ex) {
                return false; // Return false if format is totally invalid
            }
        }
    }
}
