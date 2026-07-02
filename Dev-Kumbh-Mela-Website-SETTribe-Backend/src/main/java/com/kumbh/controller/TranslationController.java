package com.kumbh.controller;

import com.kumbh.service.TranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/translations")
public class TranslationController {

    @Autowired
    private TranslationService translationService;

    @GetMapping(produces = "application/json; charset=UTF-8")
    public Map<String, String> getTranslations(@RequestParam(defaultValue = "en") String lang) {
        return translationService.getTranslationsByLanguage(lang);
    }
}
