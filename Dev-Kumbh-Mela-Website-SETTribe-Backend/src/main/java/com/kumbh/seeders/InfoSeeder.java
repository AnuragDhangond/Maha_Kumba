package com.kumbh.seeders;

import com.kumbh.entity.*;
import com.kumbh.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
@Order(7)
public class InfoSeeder {

    @Autowired
    private TranslationRepository translationRepository;
    @Autowired
    private HomepageConfigRepository configRepository;
    @Autowired
    private LiveUpdateRepository liveUpdateRepository;

    public void seed() {
        boolean isSeeding = translationRepository.count() == 0;
        if (translationRepository.count() == 0) {
            translationRepository.save(createTranslation("welcome", "Welcome to Maha Kumbh Nashik 2027", "महाकुंभ नाशिक २०२७ में आपका स्वागत है", "महाकुंभ नाशिक २०२७ मध्ये आपले स्वागत आहे", "महाकुम्भ नाशिक २०२७ मध्ये स्वागतम्"));
            translationRepository.save(createTranslation("shop", "Devotional Shop", "भक्ति दुकान", "भक्ती दुकान", "भक्ति आपणम्"));
            translationRepository.save(createTranslation("emergency", "Emergency Services", "आपातकालीन सेवाएं", "आणीबाणी सेवा", "आपत्कालीन सेवा"));
            translationRepository.save(createTranslation("live", "Live Darshan", "लाइव दर्शन", "थेट दर्शन", "प्रत्यक्ष दर्शनम्"));
            translationRepository.save(createTranslation("heritage", "Nashik Heritage", "नाशिक विरासत", "नाशिक वारसा", "नाशिक उत्तराधिकारः"));
        }

        if (configRepository.count() == 0) {
            configRepository.save(new HomepageConfig("Main Shahi Snan 2027", "2027-08-02", "2027-09-12"));
            configRepository.save(new HomepageConfig("Deepotsav Celebration", "2027-10-31", "2027-11-01"));
            configRepository.save(new HomepageConfig("Grand Laser Show", "2027-08-15", "2027-08-20"));
            configRepository.save(new HomepageConfig("Cultural Festival", "2027-07-24", "2028-07-24"));
            configRepository.save(new HomepageConfig("Flag Hoisting Ceremony", "2026-10-31", "2026-10-31"));
        }

        if (liveUpdateRepository.count() == 0) {
            
            LiveUpdate lu1 = new LiveUpdate(null, "Shahi Snan Live Update", "The first royal bath has begun at Ram Kund with thousands of devotees.", "Ram Kund", "/src/assets/snan_event.png", LocalTime.of(6, 0), LocalTime.of(18, 0), true);
            lu1.setCategory("LIVE_UPDATE");
            liveUpdateRepository.save(lu1);

            LiveUpdate lu2 = new LiveUpdate(null, "Free Medical Camp - Sector 5", "Emergency medical assistance and free checkups available 24/7 at Sector 5 hub.", "Sector 5, Nashik", "/src/assets/medical_center.png", LocalTime.of(0, 0), LocalTime.of(23, 59), false);
            lu2.setCategory("ESSENTIAL_SERVICE");
            lu2.setExternalLink("https://maps.google.com/?q=Medical+Camp+Nashik");
            liveUpdateRepository.save(lu2);

            LiveUpdate lu3 = new LiveUpdate(null, "Traffic Diversion Alert", "Main Godavari Bridge is closed for heavy vehicles. Please use the New Highway bypass.", "Nashik City Entrance", "/src/assets/interactive_route_map.png", LocalTime.of(0, 0), LocalTime.of(23, 59), true);
            lu3.setCategory("LIVE_UPDATE");
            liveUpdateRepository.save(lu3);

            LiveUpdate lu4 = new LiveUpdate(null, "Lost & Found Center", "Dedicated center for pilgrim assistance and missing person reports near Main Entrance.", "Main Gate Hub", "/src/assets/lost_found_kumbh.png", LocalTime.of(9, 0), LocalTime.of(21, 0), false);
            lu4.setCategory("ESSENTIAL_SERVICE");
            lu4.setExternalLink("https://kumbh2027.gov.in/lost-and-found");
            liveUpdateRepository.save(lu4);

            LiveUpdate lu5 = new LiveUpdate(null, "Grand Laser Show Tonight", "Spectacular laser show depicting the history of Maha Kumbh at Godavari Ghat.", "Godavari Ghat", "/src/assets/laser_event.png", LocalTime.of(19, 0), LocalTime.of(22, 0), true);
            lu5.setCategory("LIVE_UPDATE");
            liveUpdateRepository.save(lu5);
        }

        if (isSeeding) System.out.println("Global Information data seeded successfully!");
    }

    private Translation createTranslation(String key, String en, String hi, String mr, String sa) {
        Translation t = new Translation();
        t.setKey(key);
        t.setEn(en);
        t.setHi(hi);
        t.setMr(mr);
        t.setSa(sa);
        return t;
    }
}
