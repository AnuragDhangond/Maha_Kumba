package com.kumbh.config;

import com.kumbh.entity.Translation;
import com.kumbh.repository.TranslationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private TranslationRepository translationRepository;

    @Override
    public void run(String... args) throws Exception {
        if (translationRepository.count() == 0) {
            Translation t1 = new Translation();
            t1.setKey("home");
            t1.setEn("Home");
            t1.setHi("होम");
            t1.setMr("होम");
            t1.setSa("मुख्यपृष्ठम्");

            Translation t2 = new Translation();
            t2.setKey("services");
            t2.setEn("SERVICES");
            t2.setHi("सेवाएं");
            t2.setMr("सेवा");
            t2.setSa("सेवाः");

            Translation t3 = new Translation();
            t3.setKey("title");
            t3.setEn("Kumbh Mela 2027");
            t3.setHi("कुंभ मेला २०२७");
            t3.setMr("कुंभमेळा २०२७");
            t3.setSa("कुम्भमेला २०२७");

            Translation t4 = new Translation();
            t4.setKey("explore");
            t4.setEn("Explore Essential Services");
            t4.setHi("आवश्यक सेवाओं का अन्वेषण करें");
            t4.setMr("अत्यावश्यक सेवा शोधा");
            t4.setSa("आवश्यक-सेवाः अन्विष्यन्तु");

            Translation t5 = new Translation();
            t5.setKey("login");
            t5.setEn("LOGIN");
            t5.setHi("लॉगिन");
            t5.setMr("लॉगिन");
            t5.setSa("प्रवेशः");

            translationRepository.saveAll(Arrays.asList(t1, t2, t3, t4, t5));
        }
    }
}
