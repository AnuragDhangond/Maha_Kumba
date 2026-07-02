package com.kumbh.seeders;

import com.kumbh.entity.*;
import com.kumbh.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(4)
public class ActivitySeeder {

    @Autowired
    private AcharyaRepository acharyaRepository;
    @Autowired
    private PoojaItemRepository poojaItemRepository;
    @Autowired
    private PoojaScheduleRepository poojaScheduleRepository;
    @Autowired
    private LiveDarshanRepository liveDarshanRepository;
    @Autowired
    private PoojaBookingRepository poojaBookingRepository;

    public void seed() {
        boolean isSeeding = acharyaRepository.count() == 0;
        if (acharyaRepository.count() == 0) {
            acharyaRepository.save(createAcharya("Pt. Vishwanath Shastri", "Vedic Havans & Rituals", "25 Years", 4.9, 1240, "/src/assets/pooja_icon.png", "Trimbakeshwar Temple"));
            acharyaRepository.save(createAcharya("Acharya Rajesh Mani", "Jyotish & Astrology", "18 Years", 4.8, 850, "/src/assets/aarti_icon.png", "Panchavati, Nashik"));
            acharyaRepository.save(createAcharya("Pt. Suresh Dev", "Kumbh Snan Vidhi", "12 Years", 4.7, 420, "/src/assets/sadhu_event.png", "Ram Kund Ghat"));
            acharyaRepository.save(createAcharya("Swami Amitanand", "Meditation & Yoga", "15 Years", 4.9, 2100, "/src/assets/shri_adi_shankaracharya.png", "Kushavarta Kund"));
            acharyaRepository.save(createAcharya("Mata Saraswati", "Spiritual Healing", "20 Years", 4.9, 1500, "/src/assets/sant_dnyaneshwar.png", "Tapovan"));
        }

        List<Acharya> acharyas = acharyaRepository.findAll();
        for (Acharya acharya : acharyas) {
            Long aid = acharya.getId();
            List<PoojaItem> existing = poojaItemRepository.findByAcharyaId(aid);
            if (existing.isEmpty()) {
                if ("Pt. Vishwanath Shastri".equals(acharya.getName())) {
                    poojaItemRepository.save(new PoojaItem(null, "Mahamrityunjaya Pooja", 5100.0, "3 Hours", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Godavari Aarti (Evening)", 1100.0, "1 Hour", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Kalsarpa Shanti", 7500.0, "4 Hours", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Kumbh Snan Sankalp", 501.0, "30 Mins", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Rudra Abhishek", 2100.0, "2 Hours", aid));
                } else if ("Acharya Rajesh Mani".equals(acharya.getName())) {
                    poojaItemRepository.save(new PoojaItem(null, "Horoscope Reading (Kundali Milan)", 1100.0, "45 Mins", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Vastu Shastra Consultation", 5100.0, "2 Hours", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Gemstone Recommendation", 501.0, "30 Mins", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Career & Business Guidance", 2100.0, "1 Hour", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Graha Shanti Pooja", 3100.0, "2 Hours", aid));
                } else if ("Pt. Suresh Dev".equals(acharya.getName())) {
                    poojaItemRepository.save(new PoojaItem(null, "Kumbh Snan Sankalp Pooja", 1100.0, "1 Hour", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Pitru Tarpan & Shraddha Pooja", 3100.0, "2 Hours", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Pind Daan Ritual", 5100.0, "3 Hours", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Triveni Sangam Snan Vidhi", 2100.0, "1.5 Hours", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Narayan Nagbali Pooja", 8500.0, "4 Hours", aid));
                } else if ("Swami Amitanand".equals(acharya.getName())) {
                    poojaItemRepository.save(new PoojaItem(null, "Kundalini Awakening Meditation", 2100.0, "2 Hours", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Yoga Nidra & Stress Relief", 1100.0, "1 Hour", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Chakra Balancing Session", 3100.0, "2 Hours", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Spiritual Discourse & Guidance", 1500.0, "1.5 Hours", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Asthanga Yoga & Pranayama", 1200.0, "1 Hour", aid));
                } else if ("Mata Saraswati".equals(acharya.getName())) {
                    poojaItemRepository.save(new PoojaItem(null, "Reiki Healing Session", 2500.0, "1.5 Hours", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Aura Cleansing & Purification", 3500.0, "2 Hours", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Mantra Chanting & Sound Therapy", 1500.0, "1 Hour", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Inner Peace & Well-being Consultation", 1200.0, "1 Hour", aid));
                    poojaItemRepository.save(new PoojaItem(null, "Pranic Healing Session", 2000.0, "1.5 Hours", aid));
                }
            }
        }

        if (poojaScheduleRepository.count() == 0) {
            poojaScheduleRepository.save(createSchedule("Monday", "Lord Shiva", "Bhasma Aarti", "04:30 AM", "Trimbakeshwar Main Temple"));
            poojaScheduleRepository.save(createSchedule("Tuesday", "Hanuman Ji", "Sundarkand Path", "06:30 PM", "Panchavati Mandir"));
            poojaScheduleRepository.save(createSchedule("Friday", "Godavari Mata", "Ghat Deep Daan", "07:00 PM", "Ram Kund Ghat"));
            poojaScheduleRepository.save(createSchedule("Sunday", "Surya Dev", "Surya Namaskar", "06:00 AM", "Kushavarta Kund"));
            poojaScheduleRepository.save(createSchedule("Thursday", "Lord Dattatreya", "Guru Charitra Path", "10:00 AM", "Tapovan"));
        }

        if (liveDarshanRepository.count() == 0) {
            liveDarshanRepository.save(createDarshan("Main Ram Kund Live", "Panchavati, Nashik", "Live Now", "15K Viewers", "/src/assets/live_darshan_real.png", "https://www.youtube.com/live/FrWItqZTq-I?si=fXeS-3MjCItQqAR2"));
            liveDarshanRepository.save(createDarshan("Trimbakeshwar Inner Sanctum", "Trimbak, Nashik", "Live Now", "25K Viewers", "/src/assets/video1-thumbnail.webp", "https://www.youtube.com/live/FrWItqZTq-I?si=fXeS-3MjCItQqAR2"));
            liveDarshanRepository.save(createDarshan("Evening Ganga Aarti", "Ram Kund Ghat", "Starts at 07:00 PM", "Coming Soon", "/src/assets/darshan-hero3.jpg", "https://youtu.be/XlH7ejLtKyw?si=7soCaWPpt3IkAXfx"));
            liveDarshanRepository.save(createDarshan("Crowd Overview - Sector 4", "Mela Area", "Live Now", "8K Viewers", "/src/assets/holy_dip_real.png", "https://www.youtube.com/live/FrWItqZTq-I?si=fXeS-3MjCItQqAR2"));
            liveDarshanRepository.save(createDarshan("Deepotsav Celebration", "Godavari Ghats", "Upcoming", "2K Waiting", "/src/assets/deepotsav_event.png", "https://www.youtube.com/live/FrWItqZTq-I?si=fXeS-3MjCItQqAR2"));
        }

        if (isSeeding) System.out.println("Activity data seeded successfully!");
    }

    private PoojaSchedule createSchedule(String day, String deity, String pooja, String time, String place) {
        PoojaSchedule s = new PoojaSchedule();
        s.setDay(day);
        s.setDeity(deity);
        s.setSpecialPooja(pooja);
        s.setTime(time);
        s.setPlace(place);
        return s;
    }

    private LiveDarshan createDarshan(String title, String loc, String status, String viewers, String img, String link) {
        LiveDarshan d = new LiveDarshan();
        d.setTitle(title);
        d.setLocation(loc);
        d.setStatus(status);
        d.setViewers(viewers);
        d.setImagePath(img);
        d.setLink(link);
        d.setTime(java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("hh:mm a")));
        return d;
    }

    private Acharya createAcharya(String name, String specialty, String exp, Double rating, Integer reviews, String img, String loc) {
        Acharya a = new Acharya();
        a.setName(name);
        a.setSpecialty(specialty);
        a.setExperience(exp);
        a.setRating(rating);
        a.setReviews(reviews);
        a.setImagePath(img);
        a.setLocation(loc);
        return a;
    }
}
