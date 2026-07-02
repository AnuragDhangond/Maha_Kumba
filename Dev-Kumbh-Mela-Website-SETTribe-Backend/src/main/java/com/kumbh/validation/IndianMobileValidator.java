package com.kumbh.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class IndianMobileValidator implements ConstraintValidator<ValidIndianMobile, String> {

    private static final Pattern MOBILE_PATTERN = Pattern.compile("^[6-9][0-9]{9}$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true; // Let @NotBlank handle empty fields
        }
        return MOBILE_PATTERN.matcher(value).matches();
    }
}
