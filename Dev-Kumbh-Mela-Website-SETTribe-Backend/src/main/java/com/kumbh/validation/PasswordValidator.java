package com.kumbh.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    // Ensures 8-12 characters, at least one digit, one lowercase, one uppercase, and one special character
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,12}$"
    );

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true; // Let @NotBlank handle empty fields
        }

        String password = value.trim();

        if (password.length() < 8 || password.length() > 12) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Password must be between 8 and 12 characters")
                   .addConstraintViolation();
            return false;
        }

        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
                   .addConstraintViolation();
            return false;
        }

        return true;
    }
}
