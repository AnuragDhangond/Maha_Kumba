package com.kumbh.service;

import com.kumbh.entity.Translation;
import com.kumbh.repository.TranslationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TranslationService {

    @Autowired
    private TranslationRepository translationRepository;

    public Map<String, String> getTranslationsByLanguage(String lang) {
        List<Translation> translations = translationRepository.findAll();
        Map<String, String> result = new HashMap<>();

        for (Translation t : translations) {
            String value;
            switch (lang.toLowerCase()) {
                case "hi":
                    value = t.getHi();
                    break;
                case "mr":
                    value = t.getMr();
                    break;
                case "sa":
                    value = t.getSa();
                    break;
                case "en":
                default:
                    value = t.getEn();
                    break;
            }
            if (value != null && !value.trim().isEmpty()) {
                result.put(t.getKey(), value);
            } else {
                result.put(t.getKey(), t.getEn()); // Fallback to English
            }
        }
        return result;
    }
}
