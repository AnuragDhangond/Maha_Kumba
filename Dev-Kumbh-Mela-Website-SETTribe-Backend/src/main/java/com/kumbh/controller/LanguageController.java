package com.kumbh.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LanguageController {

    @GetMapping(value = "/languages", produces = "application/json; charset=UTF-8")
    public List<Map<String, String>> getLanguages() {
        List<Map<String, String>> languages = new ArrayList<>();
        
        languages.add(createLanguage("en", "English"));
        languages.add(createLanguage("hi", "हिन्दी"));
        languages.add(createLanguage("mr", "मराठी"));
        languages.add(createLanguage("sa", "संस्कृत"));
        
        return languages;
    }

    private Map<String, String> createLanguage(String code, String label) {
        Map<String, String> lang = new HashMap<>();
        lang.put("code", code);
        lang.put("label", label);
        return lang;
    }
}
