package com.kumbh.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ContentController {

    @GetMapping("/content")
    public Map<String, String> getContent(@RequestParam(defaultValue = "en") String lang) {
        Map<String, String> content = new HashMap<>();
        
        // This is a sample. In a production app, you would fetch the content 
        // in 'en' from your DB and then use a translation service (like AWS Translate or Azure)
        // if the requested language is not English.
        
        String title = "Sacred Confluence of Souls";
        String description = "Experience the divine energy of the Godavari river during the Shahi Snan.";

        if (lang.equals("hi")) {
            content.put("title", "आत्माओं का पवित्र संगम");
            content.put("description", "शाही स्नान के दौरान गोदावरी नदी की दिव्य ऊर्जा का अनुभव करें।");
        } else if (lang.equals("mr")) {
            content.put("title", "आत्म्यांचा पवित्र संगम");
            content.put("description", "शाही स्नानादरम्यान गोदावरी नदीच्या दिव्य ऊर्जेचा अनुभव घ्या।");
        } else {
            content.put("title", title);
            content.put("description", description);
        }

        return content;
    }
}
