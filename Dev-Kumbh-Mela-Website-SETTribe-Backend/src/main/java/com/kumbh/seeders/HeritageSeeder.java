package com.kumbh.seeders;

import com.kumbh.entity.*;
import com.kumbh.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;

@Component
@Order(3)
public class HeritageSeeder {

    @Autowired
    private SpiritualPlaceRepository spiritualPlaceRepository;
    @Autowired
    private HeritageHistoryRepository heritageHistoryRepository;
    @Autowired
    private KumbhHighlightRepository kumbhHighlightRepository;
    @Autowired
    private SaintDirectoryRepository saintDirectoryRepository;

    public void seed() {
        boolean isSeeding = spiritualPlaceRepository.count() == 0;
        seedSpiritualPlaces();
        seedHistory();
        seedHighlights();
        seedSaints();
        if (isSeeding) System.out.println("Heritage data seeded successfully!");
    }

    private void seedSpiritualPlaces() {
        if (spiritualPlaceRepository.count() == 0) {

            savePlace("Trimbakeshwar Jyotirlinga",
                    "The primary Jyotirlinga of Maharashtra, Trimbakeshwar is the epicenter of the Kumbh Mela.",
                    "/src/assets/trimbakeshwar.png", 1);
            savePlace("Kushavarta Kund",
                    "The sacred pond at Trimbakeshwar where the Godavari river reappears. Holiest spot for Shahi Snan.",
                    "/src/assets/sacred_ghat_card.png", 2);
            savePlace("Ram Kund (Panchavati)", "The holiest spot in Nashik where Lord Rama took his bath during exile.",
                    "/src/assets/ramkund.png", 3);
            savePlace("Kalaram Temple",
                    "An architectural marvel built in 1782 with black stones. Symbol of Nashik's spiritual heritage.",
                    "/src/assets/kalaram.png", 4);
            savePlace("Pandavleni Caves",
                    "Ancient rock-cut caves representing the Buddhist heritage in the Nashik region.",
                    "/src/assets/pandavleni.png", 5);
        }
    }

    private void seedHistory() {
        if (heritageHistoryRepository.count() == 0) {

            saveHistory("Sacred Origins", "The Legend of Samudra Manthan",
                    "The Kumbh Mela originates from the Puranic legend of the churning of the ocean (Samudra Manthan) for the nectar of immortality (Amrit).",
                    "One of the four drops of Amrit fell at Nashik-Trimbakeshwar, making it a gateway to spiritual liberation.",
                    "/src/assets/whole_kumbh_mela.png",
                    "https://youtu.be/sW7QivYXUpk?si=hjU9Xl-Am0I1uu8f");
            saveHistory("Nashik's Legacy", "The Tapasya of Gautama Rishi",
                    "Sage Gautama performed intense penance at Brahmagiri hills to bring the Godavari river to Earth for the welfare of humanity.",
                    "Since then, the Godavari has been revered as the 'Dakshin Ganga' (Ganges of the South).",
                    "/src/assets/godavari_river_hero.png",
                    "https://youtu.be/VUev_TjkwjQ?si=g4E4iDrHPSF25-dp");
            saveHistory("Simhastha Kumbh", "When Jupiter enters Leo",
                    "The Nashik Kumbh is unique as it is held when Jupiter (Guru) enters the Leo (Simha) zodiac sign.",
                    "This celestial alignment brings millions of seekers to the banks of Godavari for a rare opportunity of spiritual purification.",
                    "/src/assets/whole_kumbh_mela.png",
                    "https://youtu.be/Jv0t-XlXTGQ?si=4uoLU_sMPPcldFc1");
            saveHistory("Panchavati's Role", "Lord Rama's Exile",
                    "During his exile, Lord Rama along with Sita and Lakshmana lived in Panchavati.",
                    "The region is filled with memories of the Ramayana epic, enhancing its spiritual significance.",
                    "/src/assets/history-hero.png",
                    "https://youtu.be/zf-o4KXWbS8?si=VRBYLVPHruzDTQRH");

        }
    }

    private void seedHighlights() {
        if (kumbhHighlightRepository.count() == 0) {

            saveHighlight("1991", "Infrastructural Milestone",
                    "The first modern-era Kumbh that saw significant urban development in Nashik.",
                    "/src/assets/history-hero.png");
            saveHighlight("2003", "Kumbh of the Century",
                    "Recorded over 10 million pilgrims during the peak Shahi Snan dates.",
                    "/src/assets/gallery1.jpg");
            saveHighlight("2015", "Digital & Safe Kumbh",
                    "First use of real-time crowd management and smart pilgrim assistance systems.",
                    "/src/assets/gallery2.jpg");
            saveHighlight("2021", "Resilience Kumbh", "Spiritual continuity amidst global challenges.",
                    "/src/assets/gallery3.jpg");
            saveHighlight("2027", "Eco-Green Simhastha",
                    "The 2027 Mela is themed around 'Zero Waste' and 'Sustainable Spirituality'.",
                    "/src/assets/gallery4.jpg");
        }
    }

    private void seedSaints() {
        if (saintDirectoryRepository.count() == 0) {

            saveSaint("Sant Dnyaneshwar", "Varkari Sampradaya", "A revered Maharashtrian saint, poet, and philosopher.",
                    "Spiritual Leader", "/src/assets/sant_dnyaneshwar.png");
            saveSaint("Sant Tukaram", "Varkari Sampradaya",
                    "A prominent Varkari Sant and spiritual poet of the Bhakti movement.", "Bhakti Saint",
                    "/src/assets/sant_tukaram.png");
            saveSaint("Shri Adi Shankaracharya", "Advaita Vedanta",
                    "The great philosopher who consolidated the doctrine of Advaita Vedanta.", "Philosopher",
                    "/src/assets/shri_adi_shankaracharya.png");
            saveSaint("Swami Samarth", "Dattatreya Tradition",
                    "A widely respected spiritual master of the Dattatreya tradition.", "Spiritual Master",
                    "/src/assets/swami_samarth.png");
            saveSaint("Mahant Vishwanath Giri", "Juna Akhada", "A respected leader of the largest Shaiva order.",
                    "Mahamandaleshwar", "/src/assets/sadhu_event.png");
        }
    }

    private void savePlace(String name, String desc, String img, int order) {
        SpiritualPlace p = new SpiritualPlace();
        p.setPlaceName(name);
        p.setDescription(desc);
        p.setImage(img);
        p.setDisplayOrder(order);
        p.setStatus("ACTIVE");
        spiritualPlaceRepository.save(p);
    }

    private void saveHistory(String title, String subtitle, String p1, String p2, String bg, String video) {
        HeritageHistory h = new HeritageHistory();
        h.setTitle(title);
        h.setSubtitle(subtitle);
        h.setHeading(title);
        h.setParagraph1(p1);
        h.setParagraph2(p2);
        h.setBackgroundImage(bg);
        h.setVideoUrl(video);
        h.setStatus("ACTIVE");
        heritageHistoryRepository.save(h);
    }

    private void saveHighlight(String year, String title, String desc, String img) {
        KumbhHighlight h = new KumbhHighlight();
        h.setYear(year);
        h.setTitle(title);
        h.setDescription(desc);
        h.setThumbnailImage(img);
        h.setStatus("ACTIVE");
        kumbhHighlightRepository.save(h);
    }

    private void saveSaint(String name, String akhada, String desc, String role, String img) {
        SaintDirectory s = new SaintDirectory();
        s.setName(name);
        s.setAkhada(akhada);
        s.setDescription(desc);
        s.setRole(role);
        s.setImage(img);
        s.setStatus("ACTIVE");
        saintDirectoryRepository.save(s);
    }
}
