package com.kumbh.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = IndianMobileValidator.class)
@Target({ ElementType.FIELD, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidIndianMobile {
    String message() default "Invalid Indian mobile number. Must be 10 digits starting with 6-9.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
