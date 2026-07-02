package com.kumbh.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class NameValidator implements ConstraintValidator<ValidName, String> {

    // Allows letters, spaces, dots, single quotes, and hyphens. Max length is handled by @Size
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-Z\\s.'-]+$");
    
    // Checks for 4 or more consecutive identical characters (e.g. "aaaaaa", "11111")
    private static final Pattern REPEATED_PATTERN = Pattern.compile("(.)\\1{3,}");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true; // Let @NotBlank handle empty fields
        }

        String trimmed = value.trim();

        if (!NAME_PATTERN.matcher(trimmed).matches()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Name contains invalid characters (numbers or special characters are not allowed)")
                   .addConstraintViolation();
            return false;
        }

        if (REPEATED_PATTERN.matcher(trimmed).find()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Name cannot contain repeated consecutive characters (e.g., 'aaaa')")
                   .addConstraintViolation();
            return false;
        }

        return true;
    }
}
